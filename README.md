# OOTP Calculator

Feel free to download this repo if you want a copy of the app.

Source code for the Position Calculator is located in `position-calculator.js`. Good luck reading it, because I barely can!

Web version can be found [here](http://ootp-calculator.herokuapp.com/).

## Positional Formulas

If you don't feel like reading through my source code (I don't blame you), you can use this table to calculate positional ratings. Plug in the player's 1-250 ratings (found in the player editor), then add the corresponding intercept to get their maximum possible positional ratings (assuming positional experience rating = 200).

**THIS ONLY WORKS FOR 1-250 RATINGS** - Inputs MUST to be the values listed in the player editor. Outputs will also be 1-250. 

| RK | POS | Height (cm) | Infield Range | Infield Error | Infield Arm | Turn DP | Catcher Ability | Catcher Arm | Outfield Range | Outfield Error | Outfield Arm | Intercept |
|:--:|:---:|:-----------:|:-------------:|:-------------:|:-----------:|:-------:|:---------------:|:-----------:|:--------------:|:--------------:|:------------:|:---------:|
|  1 |  P  |     0.00    |      1.58     |      0.62     |     0.25    |   0.12  |       0.00      |     0.00    |      0.00      |      0.00      |     0.00     |    -15    |
|  2 |  C  |     0.00    |      0.00     |      0.00     |     0.00    |   0.00  |       0.78      |     0.78    |      0.00      |      0.00      |     0.00     |    -62    |
|  3 |  1B |     3.40    |      0.42     |      0.24     |     0.03    |   0.03  |       0.00      |     0.00    |      0.00      |      0.00      |     0.00     |    -548   |
|  4 |  2B |     0.00    |      0.86     |      0.33     |     0.07    |   0.39  |       0.00      |     0.00    |      0.00      |      0.00      |     0.00     |    -77    |
|  5 |  3B |     0.00    |      0.51     |      0.29     |     0.89    |   0.13  |       0.00      |     0.00    |      0.00      |      0.00      |     0.00     |    -109   |
|  6 |  SS |     0.00    |      1.02     |      0.30     |     0.09    |   0.35  |       0.00      |     0.00    |      0.00      |      0.00      |     0.00     |    -125   |
|  7 |  LF |     0.00    |      0.00     |      0.00     |     0.00    |   0.00  |       0.00      |     0.00    |      1.17      |      0.15      |     0.23     |    -45    |
|  8 |  CF |     0.00    |      0.00     |      0.00     |     0.00    |   0.00  |       0.00      |     0.00    |      1.71      |      0.14      |     0.07     |    -162   |
|  9 |  RF |     0.00    |      0.00     |      0.00     |     0.00    |   0.00  |       0.00      |     0.00    |      1.02      |      0.16      |     0.45     |    -75    |
