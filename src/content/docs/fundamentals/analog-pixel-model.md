---
title: Inside an Event Camera Pixel
description: Functional analog circuit architecture, reference update, and non-ideal effects.
---

To understand **why** an event is generated, we first follow the analog signal produced in one pixel. The drawing below is an **original functional block diagram**, not a transistor-level reproduction of any manufacturer's circuit. Real DVS pixel schematics differ in feedback topology, capacitor arrangement, bias circuits and comparator implementation. [Lichtsteiner et al., 2008](https://doi.org/10.1109/JSSC.2007.914337) document a landmark circuit using a continuous-time logarithmic photoreceptor and switched-capacitor differencing.

![Functional signal-chain diagram: photodiode, logarithmic photoreceptor, change detector, ON/OFF comparators, reference update and asynchronous readout](/event-vision-lab.github.io/figures/dvs-pixel-architecture.svg)

*Figure 1. Simplified functional DVS pixel model. Orange arrows indicate reference-update feedback. The event timestamp may be assigned at readout or recorded downstream; this is not a complete silicon-level schematic.*

## Stage 1 — Photodiode and photocurrent

Incoming photons generate carriers in a photosensitive junction, producing photocurrent $I_{ph}$ depending on received irradiance and sensor characteristics. Photocurrent also has unwanted components including dark current and shot noise. Photon statistics become particularly important at low light levels.

## Stage 2 — Logarithmic photoreceptor

The photoreceptor transduces photocurrent into an analog signal which approximately follows the logarithm of intensity over its operating range:

$$V_{pr}(t) \approx a\log I(t)+b.$$

The approximate logarithmic transformation turns a *ratio* of intensities into a *difference* of voltages. It is the basis for temporal contrast thresholding in the ideal event camera model.

## Stage 3 — Change detection and stored reference

A capacitive differencing circuit or related analog arrangement monitors the change in photoreceptor output relative to an internal reference. In a normalized model, the difference is

$$\Delta L(t) = L(t) - L_{ref}.$$

The reference is not necessarily a digitized grayscale value. The circuit realizes a comparison with a previously retained analog state, and its exact behavior depends on the pixel implementation.

## Stage 4 — ON/OFF thresholds

Two threshold conditions produce opposite polarities:

$$\Delta L\ge C^+ \Rightarrow p=+1, \qquad \Delta L\le -C^- \Rightarrow p=-1.$$

$C^+$ and $C^-$ need not be equal in actual hardware. The familiar symmetric-threshold model $C^+=C^-=C$ is an approximation frequently used for algorithm design. Threshold mismatch between pixels creates nonuniform sensitivity.

## Stage 5 — Reference update / reset

After triggering, an analog feedback/reset mechanism updates the comparison state. An idealized simulation uses $L_{ref}\leftarrow L_{ref}+pC$. However, the physical circuit need not literally store a perfect numeric $L_{ref}$ or update in exact increments. Refractory behavior, bias currents, analog settling, and leak effects can alter consecutive event timing.

## Stage 6 — Address-event representation (AER)

Pixels request readout when events occur. Address-event representation conveys which pixel fired and its polarity; interfaces or downstream acquisition software associate a timestamp with the event. When many pixels request output simultaneously, arbitration, output bandwidth, buffering and timestamping affect the effective stream.

## What goes wrong in a real camera?

| Non-ideal effect | Origin | Consequence for data processing |
|---|---|---|
| Background activity | Circuit noise, leakage, photoreceptor fluctuations | Spurious isolated events |
| Contrast threshold mismatch | Manufacturing and bias variations | Different pixels respond at different effective thresholds |
| Refractory interval | Reset and circuit settling | Fast changes may be missed or delayed |
| Low-light conditions | Photon shot noise, reduced bandwidth | Increased timing uncertainty and noise |
| Event bursts / readout saturation | Large motion or lighting transients | Bandwidth pressure and possible event loss |
| Flicker | Artificial light modulation | Events unrelated to object motion |

These behaviors matter when later studying feature tracking, optical flow and visual-inertial odometry. Noise filtering is not a substitute for understanding their physical causes.

## Source and further reading

- [Lichtsteiner et al., IEEE JSSC (2008)](https://doi.org/10.1109/JSSC.2007.914337) — the classical DVS analog architecture.
- [Gallego et al., IEEE TPAMI (2022)](https://doi.org/10.1109/TPAMI.2020.3008413) — designs and event formation model.
- [Brändli et al., IEEE JSSC (2014)](https://doi.org/10.1109/JSSC.2014.2342715) — DAVIS hybrid pixel implementation.
