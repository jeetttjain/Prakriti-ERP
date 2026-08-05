# Fixed Asset Management — Specification

## Asset Register (`Asset.js`)
Tracks fixed capital assets and calculates annual straight-line depreciation:
$$\text{Annual Depreciation} = \text{Purchase Value} \times \left(\frac{\text{Depreciation Rate \%}}{100}\right)$$
$$\text{Current Book Value} = \text{Purchase Value} - \text{Accumulated Depreciation}$$
