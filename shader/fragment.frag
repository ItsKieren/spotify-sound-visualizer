#ifdef GL_ES
precision mediump float;
#endif

uniform float uTime;       // Time passed (frame count)
uniform float uFreq;       // Frequency of the sound
uniform float uAmp;        // Amplitude (volume)
uniform float uHue;        // Hue for color

varying float vHue;        // Passed hue from the vertex shader

void main() {
  // Add to get dynamic color based on the passed frequency and amplitude
  float r = abs(sin(uTime * 0.1 + uFreq * 0.5)) * uAmp;  // Red channel
  float g = abs(cos(uTime * 0.05 + uFreq * 0.7)) * uAmp; // Green channel
  float b = abs(sin(uTime * 0.15 + uFreq * 0.3)) * uAmp; // Blue channel

  // Add to apply hue shifting using uHue
  float shift = uHue / 255.0;
  r = mod(r + shift, 1.0);
  g = mod(g + shift, 1.0);
  b = mod(b + shift, 1.0);

  // Add to set the fragment color
  gl_FragColor = vec4(r, g, b, 1.0);
}
