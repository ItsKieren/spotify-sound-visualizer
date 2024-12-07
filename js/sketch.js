let audio, amp, fft;
let myShader;
let hueSlider;
let angle = 0.0;
let jitter = 0.0;
let slider;
let isInverted = false;  // Track if color scheme is inverted


// What loads on default. 
function preload() {
  myShader = loadShader('shader/vertex.vert', 'shader/fragment.frag');
  if (!myShader.isLoaded()) {
    console.error("Shader failed to load.");
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL)

  // Volume slider for controlling audio volume
  slider = createSlider(0, 1, 0.2, 0);
  slider.position(10, 260);

  let a = createA("https://github.com/JeffRiveraG/Sound-Visualizer---Design-Workshop", "");
  let img = createImg('images/github.png', 'GitHub Repo');
  img.parent(a); // Set the image as the child of the <a> tag
  img.size(40, 40); 
  a.position(10, 210);

  // Add an upload button for audio
  let customButton = createButton("Upload Audio");
  styleButton(customButton, 10, 10);

  // Play / Pause button
  let playback = createButton("Play/Pause");
  styleButton(playback, 10, 60);

  let colorScheme = createButton("Toggle Color Scheme");
  styleButton(colorScheme, 10, 110);

  playback.mousePressed(togglePlayback)
  colorScheme.mousePressed(toggleColorScheme)

  // Apply shader to the canvas
  shader(myShader);
  userStartAudio(); // Initialize the audio context
  
  // Set up amplitude and FFT (Fast Fourier Transform) for audio analysis
  amp = new p5.Amplitude();
  fft = new p5.FFT();

  // Trigger the custom button click event
  customButton.mousePressed(() => {
    let audioUpload = createFileInput(handleFile);
    audioUpload.attribute("accept", "audio/*");
    audioUpload.elt.click();
  });

  // Add the hue slider for controlling the hue value
  hueSlider = createSlider(0, 255, 128);
  hueSlider.position(10, 220);
}

function draw() {
  // Set the hue for the shader based on the value of the hueSlider (though the slider is not initialized yet)
  let hueValue = hueSlider.value();
  myShader.setUniform('uHue', hueValue);

  // Set the background color to black
  background(0);

  // Analyze the audio for frequency and amplitude data
  fft.analyze();
  const volume = amp.getLevel();
  let freq = fft.getCentroid(); // Get the centroid frequency
  
  // Scale the frequency value for visualization
  freq *= 0.001;

  // Introduce random jitter in rotation
  if (second() % 2 == 0) {
    jitter = random(0, 0.1);
    jitter += jitter;
  }

  // Update angle with jitter value for rotation
  angle = angle + jitter;

  // Apply rotation to the sphere based on frequency and volume data
  rotateX(sin(freq) + angle * 0.1);
  rotateY(cos(volume) + angle * 0.1);

  // Map frequency and volume to shader uniform variables for visual effects
  const mapF = map(freq, 0, 1, 0, 20);
  const mapV = map(volume, 0, 0.2, 0, 0.5);

  // Pass these values to the shader
  myShader.setUniform('uTime', frameCount);
  myShader.setUniform('uFreq', mapF);
  myShader.setUniform('uAmp', mapV);

  // Draw a fixed sphere with radius 200
  sphere(200, 400, 400);

  // Adjust volume based on the slider
  audio.setVolume(slider.value());
}

// Function to toggle playback of audio
function togglePlayback() {
  if (audio && audio.isPlaying()) {
    audio.pause(); // Pause if already playing
  } else if (audio) {
    audio.loop(); // Start playing if not playing
  }
}

// Handle file input (audio files)
function handleFile(file) {
  if (file.type === 'audio') {
    // Load and start playing the audio file immediately
    audio = loadSound(file.data, () => {
      audio.loop(); 
      // You might want to trigger the playback immediately once the file is loaded
      togglePlayback();
    });
  } else {
    console.error("Please upload a valid audio file.");
  }
}

// Adjust canvas size on window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Helper Function to style the buttons
function styleButton(button, x, y) {
  button.position(x, y);
  button.style("background-color", "transparent");
  button.style("padding", "10px 10px");
  button.style("color", "#000000");
  button.style("font-size", "16px"); 
  button.style("border", "2px solid #000000");
  button.style("border-radius", "15px");
  button.style("cursor", "pointer");
  button.style("text-decoration", "none");
}

function toggleColorScheme() {
  isInverted = !isInverted;
  myShader.setUniform('uInvert', isInverted ? 1.0 : 0.0 );
}
