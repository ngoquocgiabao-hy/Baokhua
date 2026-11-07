// đường bay máy quay: [giây tới điểm này, x, z, S, giờ, nhãn]
const K = [
  [0.0, 51, 62, 125, 16.4, null],
  [3.2, 8, 10.5, 17, 16.9, 'hotel'],
  [4.6, 4, 8.5, 15.5, 17.1, null],
  [6.9, -35, -3, 14, 17.6, 'market'],
  [9.0, -40, -37, 21, 18.1, 'park'],
  [11.4, 26, -46, 36, 18.7, 'wheel'],
  [14.0, 102, 13, 34, 19.3, 'bridge'],
  [15.6, 165, 6, 40, 19.8, null],
  [17.4, 229, -1, 18, 20.2, 'square'],
  [19.6, 150, 20, 70, 20.7, null]
];
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function at(t) {
  if (t <= K[0][0]) return { x: K[0][1], z: K[0][2], S: K[0][3], h: K[0][4] };
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) {
    const a = K[i - 1], b = K[i], u = ease((t - a[0]) / (b[0] - a[0]));
    return { x: a[1] + (b[1] - a[1]) * u, z: a[2] + (b[2] - a[2]) * u, S: Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * u), h: a[4] + (b[4] - a[4]) * u };
  }
  const L = K[K.length - 1]; return { x: L[1], z: L[2], S: L[3], h: L[4] };
}
module.exports = { K, at, DUR: K[K.length - 1][0] };
