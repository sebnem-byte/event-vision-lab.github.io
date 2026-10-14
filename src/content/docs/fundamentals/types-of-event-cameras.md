---
title: Types of Event Cameras
description: Architectures, representative sensors, and verified literature references.
---

Event-camera systems should be classified **first by their sensing architecture**, then by the product or sensor generation. **DVS, DAVIS and ATIS** describe different measurement architectures. A device such as a Gen4 DVS is a particular sensor generation, not an additional fundamental class. This distinction follows the sensor-design discussion in [Gallego et al.](https://doi.org/10.1109/TPAMI.2020.3008413).

## 1. Architectural families

### DVS — Dynamic Vision Sensor

Reports local signed temporal contrast events asynchronously. Classical DVS output is a stream of brightness-change events without a simultaneous absolute-intensity frame for each event. Read the foundational [Lichtsteiner et al. (2008)](https://doi.org/10.1109/JSSC.2007.914337).

### DAVIS — Dynamic and Active-pixel Vision Sensor

Combines dynamic vision events with conventional active-pixel sensor (APS) grayscale frames on a shared sensor. The frame channel supplies intensity information while the DVS channel supplies asynchronous temporal contrast. This is a **hybrid sensor**, not a change of the definition of an event. See [Brändli et al. (2014)](https://doi.org/10.1109/JSSC.2014.2342715).

### ATIS — Asynchronous Time-based Image Sensor

Combines change detection with asynchronously initiated brightness/exposure measurements. Brightness is encoded through the timing of events, rather than through the same frame-based APS readout used by DAVIS. See [Posch et al. (2011)](https://doi.org/10.1109/JSSC.2010.2085952).

### High-resolution, stacked or back-illuminated DVS

Modern DVS implementations improve resolution, event throughput, pixel size and operating performance while retaining asynchronous contrast-change measurement. Hardware improvements do not by themselves define a new measurement category. See [Son et al. (2017)](https://doi.org/10.1109/ISSCC.2017.7870263) and [Finateu et al. (2020)](https://doi.org/10.1109/ISSCC19947.2020.9063149).

## 2. Literature comparison table

The following table lists **representative published designs**, not an exhaustive inventory of current commercial models. Values are *reported by the cited papers* and are not necessarily measured using the same protocols. In particular, dynamic range, latency, power and throughput are difficult to compare fairly across different test conditions.

| Architecture / example | Reference year | Spatial resolution | Output modality | Architectural distinction | Original research |
|---|---:|---:|---|---|---|
| Classical DVS, Lichtsteiner et al. | 2008 | 128 × 128 | ON/OFF events | Log photoreceptor and asynchronous temporal contrast | [IEEE JSSC, DOI](https://doi.org/10.1109/JSSC.2007.914337) |
| ATIS, Posch et al. | 2011 | 304 × 240 | Contrast events + asynchronous brightness measurements | Per-pixel change-triggered PWM exposure | [IEEE JSSC, DOI](https://doi.org/10.1109/JSSC.2010.2085952) |
| DAVIS, Brändli et al. | 2014 | 240 × 180 | ON/OFF events + APS grayscale frames | Shared DVS/APS pixels | [IEEE JSSC, DOI](https://doi.org/10.1109/JSSC.2014.2342715) |
| VGA DVS, Son et al. | 2017 | 640 × 480 | ON/OFF events | 9 µm pixel; high-rate grouped AER | [ISSCC, DOI](https://doi.org/10.1109/ISSCC.2017.7870263) |
| Stacked BSI event sensor, Finateu et al. | 2020 | 1280 × 720 | ON/OFF events | Back-illuminated stacked architecture, event-rate control | [ISSCC, DOI](https://doi.org/10.1109/ISSCC19947.2020.9063149) |

## 3. Important reported characteristics

| Published design | Reported result | Interpretation / caution |
|---|---|---|
| 2008 128 × 128 DVS | Over 120 dB dynamic range; minimum 15 µs latency at greater than 1 klux; 23 mW chip power | Measurements refer to the specific paper and illumination conditions. [Source](https://doi.org/10.1109/JSSC.2007.914337) |
| 2011 ATIS | 143 dB dynamic range reported for QVGA sensor | Includes its specific time-based intensity measurement system. [Source](https://doi.org/10.1109/JSSC.2010.2085952) |
| 2014 DAVIS | 130 dB and 3 µs feature prominently in paper title | Reported sensor performance, not a universal DAVIS specification. [Source](https://doi.org/10.1109/JSSC.2014.2342715) |
| 2017 VGA DVS | 9 µm pixel pitch; 300 million events per second readout design | High throughput describes output architecture, not constant stream rate. [Source](https://doi.org/10.1109/ISSCC.2017.7870263) |
| 2020 stacked DVS | 4.86 µm pixel size; 1.066 Gevents/s readout | Demonstrates architecture scaling; does not imply every commercial Gen4 module has identical specifications. [Source](https://doi.org/10.1109/ISSCC19947.2020.9063149) |

## 4. Which camera architecture is suitable for which research problem?

For algorithm education, a classical DVS is sufficient to understand event triggering and polarity data. For research that requires a synchronized grayscale channel, a **DAVIS-style hybrid** sensor offers both event and APS modalities. ATIS demonstrates another method of delivering intensity information on demand. High-resolution DVS devices are interesting for fine spatial structure, but higher spatial resolution alone does not guarantee better VIO/SLAM performance: event noise, optics, synchronization, field of view, processing throughput and the scene all matter.

### Discussion questions

1. Why can a DVS not reconstruct absolute intensity from a single event tuple?
2. Why is ATIS not simply another name for DAVIS?
3. How does increasing sensor resolution affect event bandwidth and downstream memory requirements?
4. Why should published latency or dynamic range numbers never be treated as directly comparable without the test protocol?

## References

- [Gallego et al., “Event-Based Vision: A Survey,” IEEE TPAMI (2022)](https://doi.org/10.1109/TPAMI.2020.3008413).
- [Lichtsteiner, Posch & Delbrück, IEEE JSSC (2008)](https://doi.org/10.1109/JSSC.2007.914337).
- [Posch, Matolin & Wohlgenannt, IEEE JSSC (2011)](https://doi.org/10.1109/JSSC.2010.2085952).
- [Brändli et al., IEEE JSSC (2014)](https://doi.org/10.1109/JSSC.2014.2342715).
- [Son et al., ISSCC (2017)](https://doi.org/10.1109/ISSCC.2017.7870263).
- [Finateu et al., ISSCC (2020)](https://doi.org/10.1109/ISSCC19947.2020.9063149).
