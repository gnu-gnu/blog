"""실제 Sionna 2.x LMMSEChannelEstimator에서 1e-12 가드의 동작을 확인한다.
1) 파일럿 없는 행: 주파수 공분산 대각에 허수 잔여물 ε을 더했을 때 출력의 유한성과 기준 대비 변화.
2) 전력 스케일: 공분산과 수신 신호, 잡음을 α만큼 일관되게 줄였을 때 결과가 비례하는지.
   이론상 h_hat(α)=√α·h_hat(1), err_var(α)=α·err_var(1)이다."""
import importlib.metadata as md, math
import torch
from sionna.phy.ofdm import ResourceGrid, LMMSEChannelEstimator, tdl_freq_cov_mat, tdl_time_cov_mat
print('sionna', md.version('sionna'), 'torch', torch.__version__, 'device cpu')
torch.manual_seed(151980)
FFT, SYM = 64, 14
rg = ResourceGrid(num_ofdm_symbols=SYM, fft_size=FFT, subcarrier_spacing=30e3, num_tx=1, num_streams_per_tx=1,
                  pilot_pattern='kronecker', pilot_ofdm_symbol_indices=[2, 11], device='cpu')
Rf0 = tdl_freq_cov_mat('A', 30e3, FFT, 100e-9).to(torch.complex64).cpu()
Rt0 = tdl_time_cov_mat('A', 3.0, 3.5e9, 35.7e-6, SYM).to(torch.complex64).cpu()
Rf0 = (Rf0+Rf0.conj().T)/2; Rt0 = (Rt0+Rt0.conj().T)/2
print('대각 허수부 최대(대칭화 후)', float(Rf0.diagonal().imag.abs().max()), float(Rt0.diagonal().imag.abs().max()))
B = 16
mask = rg.pilot_pattern.mask[0, 0].bool().cpu(); pilots = rg.pilot_pattern.pilots[0, 0].cpu()
Lf = torch.linalg.cholesky((Rf0+1e-6*torch.eye(FFT, dtype=Rf0.dtype)).to(torch.complex128)).to(torch.complex64)
Lt = torch.linalg.cholesky((Rt0+1e-6*torch.eye(SYM, dtype=Rt0.dtype)).to(torch.complex128)).to(torch.complex64)
z = torch.complex(torch.randn(B, SYM, FFT), torch.randn(B, SYM, FFT))/math.sqrt(2)
H = Lt @ z @ Lf.T
x = torch.zeros(SYM, FFT, dtype=torch.complex64); x[mask] = pilots
NO = 0.05
n = torch.complex(torch.randn(B, SYM, FFT), torch.randn(B, SYM, FFT))/math.sqrt(2)
y0 = H*x+math.sqrt(NO)*n
def run(Rf, Rt, y, no):
    est = LMMSEChannelEstimator(rg, Rt, Rf, order='f-t', device='cpu')
    h, e = est(y[:, None, None], torch.tensor(no, dtype=torch.float32))
    return h[:, 0, 0, 0, 0], e[:, 0, 0, 0, 0]
hb, eb = run(Rf0, Rt0, y0, NO)
print('기준 유한', bool(torch.isfinite(hb.real).all() and torch.isfinite(hb.imag).all() and torch.isfinite(eb).all()), '채널 NMSE dB', round(float(10*torch.log10((hb-H).abs().pow(2).sum()/H.abs().pow(2).sum())), 2))
print('\n[1] 대각 허수 잔여물 ε, 정상 전력')
for eps in (1e-25, 1e-21, 1e-19, 1e-13, 1e-12, 6e-11, 1e-8):
    Rf = Rf0+1j*eps*torch.eye(FFT, dtype=torch.complex64)
    h, e = run(Rf, Rt0, y0, NO)
    fin = bool(torch.isfinite(h.real).all() and torch.isfinite(h.imag).all() and torch.isfinite(e).all())
    print(f'eps={eps:.0e} 유한 {fin} h 차이 {float((h-hb).abs().max()):.3e} err_var 차이 {float((e-eb).abs().max()):.3e} 0번 부반송파 h 평균크기 {float(h[:, :, 0].abs().mean()):.3f} (기준 {float(hb[:, :, 0].abs().mean()):.3f})')
print('\n[2] 전력 스케일 α: 이론값 √α·h_hat(1), α·err_var(1) 대비')
for a in (1., 1e-4, 1e-8, 1e-10, 1e-11, 1e-12, 1e-13, 1e-14, 1e-16):
    h, e = run(a*Rf0, a*Rt0, math.sqrt(a)*y0, a*NO)
    ref = math.sqrt(a)*hb
    rel = float((h-ref).abs().pow(2).sum()/ref.abs().pow(2).sum())
    print(f'alpha={a:.0e} 유한 {bool(torch.isfinite(h.real).all() and torch.isfinite(e).all())} 상대오차 {rel:.3e} |h|/√α 평균 {float(h.abs().mean())/math.sqrt(a):.4f} (기준 {float(hb.abs().mean()):.4f}) h=0 비율 {float((h == 0).float().mean()):.3f} err_var/α 평균 {float(e.mean())/a:.4f} (기준 {float(eb.mean()):.4f})')
print('\n[3] 공분산만 전력 α로 맞추고 시간 공분산은 단위인 경우(주파수 단계 가드만 스케일)')
for a in (1e-10, 1e-12, 1e-13, 1e-14):
    h, e = run(a*Rf0, Rt0, math.sqrt(a)*y0, a*NO)
    print(f'alpha={a:.0e} h=0 비율 {float((h == 0).float().mean()):.3f} |h|/√α 평균 {float(h.abs().mean())/math.sqrt(a):.4f}')
