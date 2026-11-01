// h·hᴴ 대각 허수부를 만드는 곱셈 방식을 직접 구현해, 실측 커널의 0/비0 패턴과 비교한다.
// 실제 커널의 내부를 재현한 코드가 아니라, 어떤 연산 순서가 그 패턴을 만들 수 있는지 보는 모델이다.
// 빌드: gcc -O2 -ffp-contract=off fma_kernel_model.c -lm -o /tmp/fma_kernel (fma는 명시 호출만)
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#define K 288
#define SYM 13
#define S 2000
typedef double (*kfn)(const double *, const double *);
typedef float (*kfnf)(const float *, const float *);
#define KERNELS(T, FMA, N) \
  /* A 곱 둘을 각각 반올림한 뒤 빼서 더함: 항마다 정확히 0 */ \
  static T A##N(const T *r, const T *i) { T s = 0; for (int k = 0; k < SYM; k++) s += i[k]*r[k] - r[k]*i[k]; return s; } \
  /* B 실수부·허수부 누산기를 분리: 같은 값을 같은 순서로 더해 끝에서 뺌 */ \
  static T B##N(const T *r, const T *i) { T p = 0, q = 0; for (int k = 0; k < SYM; k++) { p = FMA(i[k], r[k], p); q = FMA(r[k], i[k], q); } return p - q; } \
  /* C 한 곱은 반올림, 다른 곱은 그 값에 FMA: 곱의 반올림 오차가 남음 */ \
  static T C##N(const T *r, const T *i) { T s = 0; for (int k = 0; k < SYM; k++) { T p = r[k]*i[k]; s += FMA(i[k], r[k], -p); } return s; } \
  /* D 한 누산기에 FMA로 번갈아 더함: 누산기 반올림이 남음 */ \
  static T D##N(const T *r, const T *i) { T s = 0; for (int k = 0; k < SYM; k++) { s = FMA(i[k], r[k], s); s = FMA(-r[k], i[k], s); } return s; } \
  /* E 한 누산기에 한쪽 곱을 전부 더한 뒤 다른 쪽을 전부 뺌: 누산 중 반올림이 남음 */ \
  static T E##N(const T *r, const T *i) { T s = 0; for (int k = 0; k < SYM; k++) s = FMA(i[k], r[k], s); for (int k = 0; k < SYM; k++) s = FMA(-r[k], i[k], s); return s; }
KERNELS(float, fmaf, f)
KERNELS(double, fma, d)
static double gauss(void) { double u = (rand()+1.0)/(RAND_MAX+2.0), v = (rand()+1.0)/(RAND_MAX+2.0); return sqrt(-2*log(u))*cos(2*M_PI*v); }
static void report(const char *n, long nz, double mx) { printf("  %-34s 비0 %7ld/%d (%5.1f%%)  최대 %.3e\n", n, nz, S*K, 100.0*nz/(S*K), mx); }
int main(void) {
  srand(151970);
  long nz[3][5] = {{0}}; double mx[3][5] = {{0}};
  for (int s = 0; s < S; s++) for (int k = 0; k < K; k++) {
    float fr[SYM], fi[SYM]; double cr[SYM], ci[SYM], dr[SYM], di[SYM];
    for (int t = 0; t < SYM; t++) { dr[t] = gauss()*0.895; di[t] = gauss()*0.895; fr[t] = (float)dr[t]; fi[t] = (float)di[t]; cr[t] = fr[t]; ci[t] = fi[t]; }
    double v[3][5] = {{Af(fr,fi),Bf(fr,fi),Cf(fr,fi),Df(fr,fi),Ef(fr,fi)},{Ad(cr,ci),Bd(cr,ci),Cd(cr,ci),Dd(cr,ci),Ed(cr,ci)},{Ad(dr,di),Bd(dr,di),Cd(dr,di),Dd(dr,di),Ed(dr,di)}};
    for (int a = 0; a < 3; a++) for (int b = 0; b < 5; b++) { double e = fabs(v[a][b]); if (e != 0) nz[a][b]++; if (e > mx[a][b]) mx[a][b] = e; }
  }
  const char *ty[3] = {"complex64", "complex64를 complex128로 캐스트", "complex128"};
  const char *kn[5] = {"A 곱 둘 반올림 후 뺌", "B 누산기 분리 후 끝에서 뺌", "C 한쪽만 FMA, 곱 오차 남음", "D 한 누산기에 FMA로 번갈아", "E 한 누산기에 전부 더한 뒤 전부 뺌"};
  for (int a = 0; a < 3; a++) { printf("%s\n", ty[a]); for (int b = 0; b < 5; b++) report(kn[b], nz[a][b], mx[a][b]); }
  return 0;
}
