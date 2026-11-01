"""비정규화 3GPP 시스템 레벨 채널에서 Sionna 2.x 1e-12 가드를 확인한다.
UMa, UMi 드롭(경로 손실·음영 포함, normalize_channel=False, SISO). 합성 채널이 아니라 Sionna 채널 모델 출력이다.
수신 신호 y=H·x+n, 잡음은 열잡음 -174 dBm/Hz + NF 5 dB, 송신 23 dBm을 송신 전력 1로 정규화한 값이다.
공분산 형태 R_emp는 시나리오의 드롭별 정규화 H로 추정한다. 공분산의 전력 표현만 바꿔 비교한다.
- normalized: 드롭별 전력 p로 입력을 나눔. 공분산 R_emp. 기준.
- abs_drop: 공분산 p·R_emp (드롭 전력을 공분산에 반영). 입력은 절대값.
- abs_pool: 공분산 p̄·R_emp (시나리오 평균 전력 p̄ 하나). 입력은 절대값.
- abs_unit: 공분산 R_emp (전력 1 그대로). 입력은 절대값."""
import importlib.metadata as md, math, sys
import torch
from sionna.phy.ofdm import ResourceGrid, LMMSEChannelEstimator
from sionna.phy.channel import GenerateOFDMChannel, gen_single_sector_topology
from sionna.phy.channel.tr38901 import PanelArray, UMa, UMi
print('sionna', md.version('sionna'), 'torch', torch.__version__)
FFT, SYM, FC, SCS = 64, 14, 3.5e9, 30e3
NO = 10**((-174+10*math.log10(FFT*SCS)+5-23)/10)/1000*1000  # 정규화 잡음(dB 비율)
print(f'정규화 잡음 {NO:.3e} ({10*math.log10(NO):.1f} dB)')
torch.manual_seed(151990)
rg = ResourceGrid(num_ofdm_symbols=SYM, fft_size=FFT, subcarrier_spacing=SCS, num_tx=1, num_streams_per_tx=1,
                  pilot_pattern='kronecker', pilot_ofdm_symbol_indices=[2, 11], device='cpu')
mask = rg.pilot_pattern.mask[0, 0].bool().cpu(); pilots = rg.pilot_pattern.pilots[0, 0].cpu()
x = torch.zeros(SYM, FFT, dtype=torch.complex64); x[mask] = pilots
ut = PanelArray(1, 1, 'single', 'V', 'omni', FC, device='cpu'); bs = PanelArray(1, 1, 'single', 'V', '38.901', FC, device='cpu')
def herm(A): return (A+A.conj().T)/2
def est(Rf, Rt, y, no):
    e = LMMSEChannelEstimator(rg, Rt, Rf, order='f-t', device='cpu')
    h, v = e(y, torch.tensor(no, dtype=torch.float32))
    return h[:, 0, 0, 0, 0]
for name, cls, topo in (('UMa', UMa, 'uma'), ('UMi', UMi, 'umi')):
    ch = cls(carrier_frequency=FC, o2i_model='low', ut_array=ut, bs_array=bs, direction='uplink', enable_pathloss=True, enable_shadow_fading=True, device='cpu')
    gen = GenerateOFDMChannel(ch, rg, normalize_channel=False, device='cpu')
    Hs = []
    for _ in range(25):
        ch.set_topology(*gen_single_sector_topology(40, 1, topo, min_ut_velocity=3., max_ut_velocity=3., device='cpu'))
        Hs.append(gen(40)[:, 0, 0, 0, 0].cpu())
    H = torch.cat(Hs)
    p = H.abs().pow(2).mean((1, 2))
    keep = p > 0; H, p = H[keep], p[keep]
    g = 10*torch.log10(p)
    print(f'\n[{name}] 드롭 {len(H)} 경로 이득 dB 중앙값 {g.median():.1f} 5%~95% {g.quantile(.05):.1f}~{g.quantile(.95):.1f}, -130 dB 이하 {100*(g <= -130).float().mean():.1f}%, 전력 1e-13(-130 dB) 근처 SNR dB 중앙값 {(g-10*math.log10(NO)).median():.1f}')
    Hn = H/p.sqrt()[:, None, None]
    Rf = herm((Hn.transpose(1, 2) @ Hn.transpose(1, 2).conj().transpose(1, 2)/SYM).mean(0)).to(torch.complex64)
    Rt = herm((Hn @ Hn.conj().transpose(1, 2)/FFT).mean(0)).to(torch.complex64)
    d = torch.complex(torch.randn(H.shape), torch.randn(H.shape))/math.sqrt(2)
    y = H*x+math.sqrt(NO)*d
    pm = float(p.mean()); print(f'평균 전력 p̄ {pm:.3e} ({10*math.log10(pm):.1f} dB)')
    edges = [(-1e9, -140), (-140, -130), (-130, -125), (-125, -120), (-120, -110), (-110, 1e9)]
    print('경로 이득 구간 | 드롭 | 기준 NMSE dB | abs_drop h=0% | abs_drop NMSE | abs_pool h=0% | abs_pool NMSE | abs_unit h=0% | abs_unit NMSE')
    for lo, hi in edges:
        idx = ((g > lo) & (g <= hi)).nonzero().flatten()
        if len(idx) == 0: continue
        out = []
        def nm(h): return float(10*torch.log10((h-H[idx]).abs().pow(2).sum()/H[idx].abs().pow(2).sum()))
        hb = []; hd = []; hp = []; hu = []
        for i in idx.tolist():
            pi = float(p[i]); yi = y[i][None, None, None]
            hb.append(est(Rf, Rt, yi/math.sqrt(pi), NO/pi)*math.sqrt(pi))
            hd.append(est(pi*Rf, pi*Rt, yi, NO))
            hp.append(est(pm*Rf, pm*Rt, yi, NO))
            hu.append(est(Rf, Rt, yi, NO))
        hb, hd, hp, hu = map(torch.cat, (hb, hd, hp, hu))
        z = lambda h: 100*float((h == 0).float().mean())
        print(f'{lo:6.0f}~{hi:6.0f} | {len(idx):4d} | {nm(hb):7.2f} | {z(hd):6.1f} | {nm(hd):7.2f} | {z(hp):6.1f} | {nm(hp):7.2f} | {z(hu):6.1f} | {nm(hu):7.2f}', flush=True)
