using UnityEngine;

namespace QuantumEcho.Audio
{
    /// <summary>
    /// Procedurally synthesizes sound effects directly using OnAudioFilterRead.
    /// Eliminates any missing audio clips or external audio asset requirements.
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public class ProceduralAudio : MonoBehaviour
    {
        public static ProceduralAudio Instance { get; private set; }

        private double sampleRate = 48000;
        private double time = 0;

        // Active tone parameters
        private float frequency = 0f;
        private float volume = 0f;
        private float decayRate = 3.0f;
        private bool isNoise = false;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            sampleRate = AudioSettings.outputSampleRate;
        }

        public void PlayGateSound(float baseFreq = 440f)
        {
            frequency = baseFreq;
            volume = 0.35f;
            decayRate = 4.0f;
            isNoise = false;
        }

        public void PlayCollapseSound()
        {
            frequency = 120f;
            volume = 0.4f;
            decayRate = 6.0f;
            isNoise = true;
        }

        public void PlaySuccessChord()
        {
            frequency = 587.33f; // D5
            volume = 0.45f;
            decayRate = 2.0f;
            isNoise = false;
        }

        private void OnAudioFilterRead(float[] data, int channels)
        {
            if (volume <= 0.001f) return;

            for (int i = 0; i < data.Length; i += channels)
            {
                time += 1.0 / sampleRate;
                volume = Mathf.Max(0f, volume - (float)(decayRate / sampleRate));

                float sample = 0f;
                if (isNoise)
                {
                    sample = (Random.value * 2f - 1f) * volume;
                }
                else
                {
                    // Harmonic overtone blend for bell-like tone
                    double phase1 = time * frequency * 2.0 * Mathf.PI;
                    double phase2 = time * frequency * 2.0 * 2.0 * Mathf.PI;
                    sample = (float)(Mathf.Sin((float)phase1) * 0.7f + Mathf.Sin((float)phase2) * 0.3f) * volume;
                }

                for (int c = 0; c < channels; c++)
                {
                    data[i + c] += sample;
                }
            }
        }
    }
}
