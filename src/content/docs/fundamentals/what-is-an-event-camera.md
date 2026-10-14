---
title: What Is an Event Camera?
description: An in-depth introduction to asynchronous temporal-contrast vision sensors.
---

An **event camera** is a neuromorphic vision sensor that independently detects *changes* in brightness at each pixel. Rather than transmitting a complete image at a fixed frequency, a conventional dynamic vision sensor (DVS) reports changes when the magnitude of a pixel’s logarithmic brightness variation reaches a contrast threshold. The resulting asynchronous measurements are called **events**. [Gallego et al., 2022](https://doi.org/10.1109/TPAMI.2020.3008413).

## 1. Frames versus events

A conventional CMOS image sensor periodically samples its photosensitive pixels and produces an intensity array. Exposure time, frame rate, readout, and image noise determine the measured frame. In a DVS, each pixel behaves like a continuously operating contrast-change detector. **An event is not a pixel intensity measurement**; it indicates that an increase or decrease in logarithmic brightness was detected relative to that pixel's reference level.

| Property | Conventional image camera | Classical DVS event camera |
|---|---|---|
| Primary measurement | Sampled intensity | Sign of local relative brightness change |
| Readout | Images at frame intervals | Independent asynchronous events |
| Pixel output | Intensity per frame | Spatial address, polarity, event time |
| Still scene, fixed illumination | Repeated frames | Ideally no events |
| Motion | Appears as changing frames | Often produces events along moving brightness boundaries |
| Absolute brightness | Directly measured (within sensor limits) | Not directly recovered from polarity-only stream |

**Important:** A change in illumination can generate events even when no object moves. Conversely, a moving region of uniform brightness may generate few events. This is why “an event camera only sees moving objects” is an oversimplification.

## 2. The event tuple

A common mathematical event representation is

$$e_k=(x_k,y_k,t_k,p_k), \qquad p_k\in\{-1,+1\}.$$

Here $x_k,y_k$ represent the pixel address; $t_k$ is the event time; and $p_k$ is the change polarity. ON corresponds to increasing logarithmic brightness and OFF to decreasing logarithmic brightness. Timestamp location and precision depend on the sensor, readout electronics, and recording format.

## 3. Why logarithmic brightness?

We commonly model pixel brightness by $L=\log(I)$ for positive intensity $I$. A fixed change in $L$ corresponds to an approximately fixed *relative* change in $I$: for example, an ON threshold $C$ implies $I_{new}/I_{ref}=e^C$. This is better suited to detecting proportional intensity changes over a wide illumination range than a fixed absolute-intensity difference.

When $C=0.2$, an ideal ON event corresponds to approximately a 22% intensity increase from the relevant reference ($e^{0.2}-1$). This is a model-level interpretation, not a guarantee of the nominal threshold for every physical pixel.

## 4. Why asynchronous output is useful

The potential advantages include fine timing information, response to local changes, and high dynamic range. These properties can help with rapid motion, difficult lighting transitions, and low-latency visual feedback. However, low texture, very low photon flux, sensor noise, pixel mismatch, readout saturation, and flickering lights can degrade the stream.

## 5. What an event camera does not directly provide

Polarity-only DVS measurements do **not** directly include absolute intensity, optical flow, depth, object identity, or camera pose. Recovering these requires additional assumptions, algorithms, time integration, or auxiliary sensors. DAVIS and ATIS designs add distinct mechanisms for measuring intensity; they should not be confused with a purely polarity-based DVS.

## 6. From hardware to perception

1. Photons are converted to photocurrent at a photodiode.
2. A continuous-time analog front end converts input illumination to a signal typically modeled logarithmically.
3. Contrast detection compares current response with a locally retained reference.
4. An ON or OFF event is emitted when a threshold is reached.
5. A readout circuit communicates the event; downstream software groups or processes it as needed.

Continue with [Inside an Event Camera Pixel](../analog-pixel-model/) and then the [Interactive Event Generation tutorial](../how-event-cameras-work/).

## References

- [Gallego et al., “Event-Based Vision: A Survey,” IEEE TPAMI, 2022](https://doi.org/10.1109/TPAMI.2020.3008413).
- [Lichtsteiner, Posch and Delbrück, “A 128×128 120 dB 15 μs Latency Asynchronous Temporal Contrast Vision Sensor,” IEEE JSSC, 2008](https://doi.org/10.1109/JSSC.2007.914337).
