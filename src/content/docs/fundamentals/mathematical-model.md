---
title: Mathematical Model
description: A comprehensive introduction to event-camera sensing, electronics, temporal contrast, mathematical models, and event representations.
---

Event cameras report **local changes in logarithmic brightness** instead of recording a complete intensity image at every fixed frame interval. This tutorial connects the optical signal, simplified pixel electronics, an ideal threshold-crossing model, and the event stream used in robotic perception.

> **Learning goals:** Explain the event tuple, derive the ideal triggering equations, distinguish timestamp resolution from latency, and understand how asynchronous events form voxel grids and time surfaces.

## 1. What does an event camera measure?

A conventional camera periodically samples an entire array of pixel intensities. An event camera instead monitors changes independently at each pixel. If a pixel experiences a sufficiently large brightness increase it emits an **ON** event; a sufficiently large decrease produces an **OFF** event. A static scene under constant illumination ideally generates no brightness-change events, although real sensors produce noise.

The output is a stream of events:

$$
e_k=(x_k,y_k,t_k,p_k),\qquad p_k\in\{-1,+1\}.
$$

Here, $x_k,y_k$ are pixel coordinates, $t_k$ is an event timestamp, and $p_k$ is the polarity. Unlike an intensity value, a single event does not tell us the absolute brightness of its pixel.

![Four-stage overview of event generation](/figures/event-generation-pipeline.svg)

*Figure 1 — The physical-to-digital chain. Original vector schematic; the electronic operations are conceptual and refer to an idealized pixel.*

## 2. Light enters the pixel: photodiode and logarithmic front-end

Incident light generates a photocurrent in a photodiode. In a simplified operating regime, photocurrent increases approximately with incident illumination. The analog front-end converts the optical signal into a voltage related to **logarithmic intensity**. For an idealized model, write

$$
L(\mathbf{x},t)=\log I(\mathbf{x},t), \qquad \mathbf{x}=(x,y), \quad I>0.
$$

The choice of logarithm is important: a change between two intensities is

$$
\Delta L=\log I_2-\log I_1=\log\!\left(\frac{I_2}{I_1}\right).
$$

Therefore the same **ratio** of intensities yields the same ideal log-change even when the initial intensity differs. This models approximately relative contrast sensitivity; it does not imply perfect illumination invariance in a real sensor.

### Numerical example

If the intensity increases from 100 to 125 arbitrary units, the log change is $\log(1.25)\approx 0.223$. With an ideal positive threshold of $C_+=0.2$, this can trigger at least one ON event. If intensity doubles with the same threshold, the ideal model permits $\lfloor \log(2)/0.2 \rfloor=3$ positive events, provided the reference starts at the initial intensity and no opposing changes occur.

## 3. Inside an event-camera pixel: an electronic explanation

The diagram below separates the **APS frame pathway** from the **DVS event pathway** as found in a DAVIS-type hybrid pixel. A pure DVS sensor has no APS frame output. The drawing is a functional abstraction and **not** the transistor-level circuit used by every manufacturer.

![Simplified DAVIS pixel electronics with APS and DVS pathways](/figures/davis-pixel-electronics.svg)

*Figure 2 — A simplified DAVIS-style pixel architecture (original SVG schematic). Blue/cyan represents the intensity and analog front-end; the APS path samples intensity for frames, whereas the event path detects temporal contrast.*

### Photoreceptor

The photodiode generates a current related to illumination. The analog logarithmic photoreceptor turns that current into a continuous electrical signal. Real photoreceptors have finite bandwidth, device mismatch and shot noise; their response changes with lighting conditions.

### Change detector and reference

The event path compares the current log-brightness with the stored reference established after earlier events:

$$
\Delta L(\mathbf{x},t)=L(\mathbf{x},t)-L_{\mathrm{ref}}(\mathbf{x}).
$$

This **reference is not merely the intensity measured one microsecond ago**. It represents the internal reference associated with previous threshold crossings. The physical circuit may implement this through capacitive coupling, differencing and reset feedback rather than explicitly computing a digital subtraction.

### ON and OFF comparators

The comparator branches check positive and negative changes:

$$
\Delta L(\mathbf{x},t_k)\ge C_+ \quad \Longrightarrow \quad p_k=+1,
$$

$$
\Delta L(\mathbf{x},t_k)\le -C_- \quad \Longrightarrow \quad p_k=-1.
$$

We define $C_+>0$ and $C_->0$ as threshold magnitudes. They need not be equal. Device mismatch and bias settings can cause pixel-to-pixel and polarity-dependent variations.

### Reset and repeated events

After an ideal event, the reference advances by the corresponding signed threshold:

$$
L_{\mathrm{ref}}^{\mathrm{new}} =
\begin{cases}
L_{\mathrm{ref}}^{\mathrm{old}}+C_+,& p_k=+1,\\
L_{\mathrm{ref}}^{\mathrm{old}}-C_-,& p_k=-1.
\end{cases}
$$

This explains why a continuously rising brightness can generate **multiple ON events at the same pixel** rather than only one. Real reset dynamics can differ from the idealized update.

## 4. Mathematical model: intensity, threshold crossings and events

![Ideal log intensity and reference threshold crossing model](/figures/event-threshold-model.svg)

*Figure 3 — Continuous log-intensity signal (white), ideal reference changes (gold dashed) and ON/OFF threshold-crossing events. This is an explanatory simulation, not measured camera output.*

A more compact ideal event rule, for symmetric thresholds $C_+=C_-=C$, is

$$
L(\mathbf{x},t_k)-L_{\mathrm{ref}}(\mathbf{x}) = p_k C.
$$

The equality expresses the ideal threshold crossing; software sampling, noise and finite hardware bandwidth can cause overshoot. In this model the reference is changed after each event and the detector continues observing the same pixel independently.

### Worked example: a moving white object

Consider a bright white disk moving across a dark background. At a pixel along the disk's leading edge, brightness grows and produces ON events when successive thresholds are reached. While the bright interior passes, intensity may remain approximately steady and produce few events. When the disk's trailing edge moves past, brightness decreases and produces OFF events. Accumulating events from many pixels produces a moving, polarity-coded contour rather than a complete grayscale disk.

### What is reconstructed from an event stream?

If an initial log-intensity is available and the threshold model is assumed, one can integrate event polarities to obtain an approximate *change* in log-intensity:

$$
\widehat{L}(t)=L(t_0)+C\sum_{t_k\in(t_0,t]} p_k.
$$

This reconstruction is idealized. Real event streams alone do not uniquely recover the absolute intensity without additional assumptions or measurements; noise, missed events and unknown thresholds introduce drift and artifacts.

## 5. Neuromorphic analogy: retina and spike-like sensing

The word *neuromorphic* refers to the inspiration taken from biological sensing and information processing. Photoreceptors transduce light; biological retinal circuitry includes pathways sensitive to changes and ON/OFF contrast; retinal ganglion cells transmit action potentials. Event cameras use engineered circuits for a **functional analogy**: they emphasize temporal contrast and transmit sparse timestamped messages.

This is **not a claim** that the DVS pixel implements the exact anatomy, neuron dynamics or neural coding of a retina. Its ON/OFF output is digital address-event signaling, not a biological action potential. The analogy is useful for understanding why activity is sparse when the scene is static and increases when visual contrast moves.

## 6. Why high temporal resolution is different from high FPS

A 30 FPS frame camera typically samples every ~33.3 ms. An event camera has no global frame cadence in its event pathway; each pixel independently reacts to brightness changes. A sensor may represent event times at **microsecond-level timestamp granularity**, but this must not be confused with zero latency or unlimited pixel bandwidth.

| Quantity | Meaning | Practical caution |
|---|---|---|
| Timestamp resolution | Smallest unit in the event timestamp | Does not guarantee two arbitrarily close events can be resolved at a pixel |
| Latency | Time between a physical change and observable output | Depends on light level, bias and readout |
| Per-pixel bandwidth | How quickly a pixel can follow changing light | Limited by its analog circuit |
| Throughput | Events transmitted by the overall camera per second | Shared readout and USB links can saturate |

For example, the **DAVIS346** documentation lists 1 µs temporal resolution and a typical latency below 1 ms, while explicitly describing these as different metrics. See [iniVation DAVIS346 specifications](https://docs.inivation.com/hardware/current-products/davis346.html).

## 7. From raw events to an event image or voxel grid

The raw output is an irregular sequence of tuples, not a sequence of images. To display or process it with conventional computer-vision methods, we often aggregate events over a finite temporal window.

### Event accumulation image

Let a window contain events with timestamps in $[t_0,t_1)$. A signed image is

$$
A(x,y)=\sum_{k:\,t_0\le t_k<t_1}p_k\,\mathbf{1}[x_k=x,\,y_k=y].
$$

Here $\mathbf{1}[\cdot]$ is an indicator function. A count image can instead accumulate absolute event counts, and separate polarity channels avoid cancellation where ON and OFF events overlap.

### Voxel grid: preserving coarse time

A voxel representation partitions the time window into $B$ temporal bins. For each event, its timestamp is normalized to a bin coordinate and its polarity contributes to nearby grid locations. Simple binning uses one bin per event; more advanced implementations distribute contributions by temporal interpolation. The key difference from a single event image is that **the ordering of events within the window is partly retained**.

![Five-bin voxel grid constructed from a moving contour](/figures/event-voxel-grid.svg)

*Figure 4 — Five temporal slices showing a moving edge. Original scalable vector diagram. This is a schematic example of an event voxel grid.*

### Time surface

A time surface stores the latest observed event timestamp at each pixel:

$$
T_{\mathrm{last}}(x,y;t)=\max\{t_k\le t:\,(x_k,y_k)=(x,y)\}.
$$

A commonly used decayed representation is

$$
S(x,y;t)=\exp\!\left[-\frac{t-T_{\mathrm{last}}(x,y;t)}{\tau}\right].
$$

The decay constant $\tau>0$ controls how quickly older events disappear. A pixel with no recorded event in the history window needs an explicit default value. Time surfaces can also maintain ON and OFF channels separately.

### Trade-offs

| Representation | Keeps spatial location? | Keeps temporal information? | Limitation |
|---|---|---|---|
| Raw event stream | Yes | Precise event timestamps | Variable-rate, irregular data |
| Accumulated event image | Yes | Only window membership | Loses within-window event timing |
| Voxel grid | Yes | Coarse bin-level timing | Memory and bin-width choices |
| Time surface | Yes | Last-event recency | Older event history is discarded |

## 8. DVS, DAVIS and other sensor architectures

**DVS** refers to a change-triggered vision sensor; **DAVIS** combines DVS events with APS frame imaging in the same pixel array; **ATIS** combines events with asynchronous intensity measurement. Sensor generations (such as Gen4) should not be confused with these broader architecture categories.

| Example | Architecture | Resolution | Typical output |
|---|---|---|---|
| DVS128 | DVS | 128 × 128 | ON/OFF events |
| ATIS | Event-based intensity sensing | 304 × 240 | Events plus asynchronous intensity information |
| DAVIS240 | DVS + APS | 240 × 180 | Events and frames |
| DAVIS346 | DVS + APS | 346 × 260 | Events and frames |
| Prophesee Gen4 HD | Modern event sensor | 1280 × 720 | Events |

Values are representative of these named devices, not universal limits of the architectures. For the DAVIS346's detailed specifications see the [official hardware documentation](https://docs.inivation.com/hardware/current-products/davis346.html).

## 9. When does event vision help robotics — and when does it struggle?

Event cameras are promising for fast ego-motion, high-dynamic-range scenes and low-latency visual odometry because they can report rapid brightness changes without waiting for frame boundaries. In visual-inertial odometry and SLAM, the event stream is combined with tracking, geometry, inertial sensing and estimation algorithms. High temporal resolution alone does **not** guarantee better pose accuracy.

Pure rotations, feature-poor surfaces, very slow motion, extremely low illumination, flicker, noisy pixels and bandwidth saturation can cause difficulties. A stationary camera looking at a static scene generates few informative events; this is efficient for data transmission but can make continuous feature observation challenging.

## 10. Mini exercises

1. A pixel's intensity doubles with threshold $C=0.2$. Assuming symmetric ideal thresholds and an initial reference equal to the original intensity, calculate how many ON events are produced.
2. Why can a bright moving disk produce event activity mainly at its edges?
3. Which is lost when 10 ms of events are collapsed into a single accumulation image?
4. Explain why **1 µs timestamp resolution** does not guarantee **1 µs latency**.
5. Draw two separate DAVIS pathways after the photodiode: APS and DVS. Which pathway produces frames?

## 11. References and further reading

- Gallego et al. (2022), [Event-Based Vision: A Survey](https://doi.org/10.1109/TPAMI.2020.3008413), *IEEE TPAMI*. Comprehensive treatment of sensing, algorithms and applications.
- Lichtsteiner, Posch and Delbrück (2008), [A 128×128 120 dB 15 µs Latency Asynchronous Temporal Contrast Vision Sensor](https://doi.org/10.1109/JSSC.2007.914337), *IEEE JSSC*. Classical DVS architecture and electronic design.
- Brändli et al. (2014), [A 240×180 130 dB 3 µs Latency Global Shutter Spatiotemporal Vision Sensor](https://doi.org/10.1109/JSSC.2014.2342715), *IEEE JSSC*. DAVIS frame and event integration.
- [iniVation DAVIS346 official documentation](https://docs.inivation.com/hardware/current-products/davis346.html). Device specifications and distinctions between temporal resolution and latency.

**Next:** Study the event-data structure and build an event image, a five-bin voxel grid and a time surface from a short MVSEC `indoor_flying1` event window.
