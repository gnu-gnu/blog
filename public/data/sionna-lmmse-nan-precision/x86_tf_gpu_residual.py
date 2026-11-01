# 실제 경로 근사: TF 2.17 x86 GPU의 tf.matmul(h, h, adjoint_b=True) 대각 허수부. compute_cov_mat의 평균 방식과 같게 합성 입력에 적용한다.
# 입력은 합성 복소 정규(288x13, 배치 30)이며 실제 UMi 채널이 아니다. 대각 허수부 규모와 스케일 식의 유한성만 본다.
import json, sys
import numpy as np, tensorflow as tf
g = tf.config.list_physical_devices('GPU'); tf.config.experimental.set_memory_growth(g[0], True)
print('tf', tf.__version__, tf.config.experimental.get_device_details(g[0]).get('device_name'), 'build', tf.sysconfig.get_build_info().get('cuda_version'))
IT = int(sys.argv[1]) if len(sys.argv) > 1 else 3334
def h64():
    s = (30, 13, 288)
    return tf.complex(tf.random.normal(s, stddev=.7071, dtype=tf.float32), tf.random.normal(s, stddev=.7071, dtype=tf.float32))
def h128():
    s = (30, 13, 288)
    return tf.complex(tf.random.normal(s, stddev=.7071, dtype=tf.float64), tf.random.normal(s, stddev=.7071, dtype=tf.float64))
@tf.function(jit_compile=False)
def cov(x):
    x = tf.transpose(x, [0, 2, 1])  # [batch, sc, sym] 빈도 공분산: 부반송파 공간
    return tf.reduce_mean(tf.matmul(x, x, adjoint_b=True)/tf.cast(13, x.dtype), axis=0)
def run(name, make, device, n):
    tf.keras.utils.set_random_seed(151960)
    with tf.device(device):
        acc = None
        for _ in range(n):
            c = cov(make())
            acc = c if acc is None else acc+c
        acc = acc/tf.cast(n, acc.dtype)
    d = np.diag(acc.numpy()); e = np.abs(d.imag); r = d.real
    f = tf.cast(acc, tf.complex64).numpy(); dc = np.diag(f)
    s = np.divide(2*dc, 1j*dc.imag, out=np.zeros_like(dc), where=dc.imag != 0)
    with np.errstate(all='ignore'):
        v = s*(s-1)*np.complex64(0)
    print(f'{name:24} {device:7} n={n} 0아닌 대각 {np.count_nonzero(e)}/288 max {e.max():.3e} min(0 제외) {e[e>0].min() if (e>0).any() else 0:.3e} complex64 저장 후 max {np.abs(dc.imag).max():.3e} 0아닌 {np.count_nonzero(dc.imag)}, 최대 |s| {np.abs(s).max():.3e}, NaN 원소 {int(np.isnan(v).sum())}', flush=True)
run('complex64 matmul', h64, '/GPU:0', IT)
run('complex64 입력 캐스트 c128', lambda: tf.cast(h64(), tf.complex128), '/GPU:0', IT)
run('complex128 입력', h128, '/GPU:0', IT)
run('complex64 matmul', h64, '/CPU:0', min(IT, 200))
run('complex64 입력 캐스트 c128', lambda: tf.cast(h64(), tf.complex128), '/CPU:0', min(IT, 200))
