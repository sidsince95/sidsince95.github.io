---
layout: post
title: "The Assumptions of Linear Regression, Explained in One Equation"
date: 2026-10-18
description: "The assumptions of OLS, derived from a single line of algebra: what each one protects, what breaks when markets violate it, and how quants fix it. With an interactive lab."
tags: [statistics, econometrics, quant]
math: true
structured: true
---

<div id="ps-anchor"></div>

Linear regression is the first model everyone learns and the last one most people actually understand.

I have been through it more times than I can count: in undergrad, in my master's, in interview prep, at work. Every textbook does the same thing. It derives $$\hat{\beta} = (X^TX)^{-1}X^Ty$$, and then it hands you a list. Linearity. Exogeneity. Homoskedasticity. No autocorrelation. No multicollinearity. Normality. Six rules, stated as if they all do the same job, with no explanation of *where they come from*.

So I did what everyone does. I memorized the list. And it never stuck, because a list you can't derive is a list you can't reason with. I could recite "homoskedasticity," but I couldn't tell you which violation is a minor annoyance and which one quietly destroys your model. I couldn't tell you why normality is on the list at all when half the books say you don't need it. And the word "exogeneity" meant nothing to me beyond "a thing you're supposed to say."

This post is the explanation that finally made it click for me. The idea is simple:

> **Every assumption of linear regression exists to control one piece of a single equation.** Read that equation from left to right, and the assumptions fall out in order, each one unlocking the next step of the math.

Once you see it this way, you don't memorize the list anymore. You can rebuild it on a napkin, rank the assumptions by how much damage their failure does, and know what to reach for when one of them breaks.

<nav class="ps-contents" aria-label="Contents"></nav>

## Part I · The one equation {#part-1}

Here is the whole story before any algebra. You have a column of outcomes $$y$$ (say, next week's stock returns) and a table of features $$X$$ (a momentum signal, a value signal, a market beta). You believe the outcome is a weighted sum of the features plus noise you can't see. You want the *true* weights $$\beta$$; OLS gives you an *estimate* $$\hat{\beta}$$.

The key move is to write the estimate as **the truth plus an error**, then stare at the error. That error is built from three pieces. Each assumption is a guarantee about one piece, and when a guarantee fails you can point to exactly which piece misbehaved and what it costs you.

### Deriving it in four steps {#derivation}

Suppose the true **data generating process** (DGP), the way the world actually produces your data, is

$$y = X\beta + \varepsilon$$

where $$y$$ is an $$n \times 1$$ vector of outcomes, $$X$$ is an $$n \times k$$ matrix of features, $$\beta$$ is the $$k \times 1$$ vector of true weights, and $$\varepsilon$$ is the $$n \times 1$$ vector of noise: everything that moves $$y$$ that isn't in your spreadsheet.

OLS picks the weights that minimize the sum of squared residuals, $$\min_{\hat{\beta}} \Vert y - X\hat{\beta} \Vert_2^2$$. Now watch what happens when we plug the *true* $$y$$ into the answer.

<div class="ps-steps" markdown="1">

**Step 1.** Start with the standard OLS formula:

$$\hat{\beta} = (X^T X)^{-1} X^T y$$

**Step 2.** Substitute the true data generating process, $$y = X\beta + \varepsilon$$:

$$\hat{\beta} = (X^T X)^{-1} X^T (X\beta + \varepsilon)$$

**Step 3.** Multiply it out across the parentheses:

$$\hat{\beta} = (X^T X)^{-1} (X^T X)\, \beta + (X^T X)^{-1} X^T \varepsilon$$

**Step 4.** A matrix times its own inverse is the identity, $$(X^T X)^{-1}(X^T X) = I$$, so we are left with:

</div>

<div class="ps-key" markdown="1">

$$\hat{\beta} = \beta + \underbrace{(X^T X)^{-1} X^T \varepsilon}_{\text{the estimation error}}$$

</div>

This is the master equation for everything that follows. Your estimate equals the truth, plus an error term.

### The three pieces of the error {#three-pieces}

| Piece | What it is | When it misbehaves |
|---|---|---|
| $$(X^T X)^{-1}$$ | The inverse of the feature covariance | Features are collinear, so the inverse explodes |
| $$X^T \varepsilon$$ | The alignment between your features and the noise | An omitted variable or look-ahead leaks into the noise |
| $$\varepsilon$$ | The noise vector itself | Fat tails, changing variance, or autocorrelation |

### The map for the rest of the post {#map}

Treat the master equation as an assembly line. Each assumption is a permission slip that unlocks the next mathematical operation. Every stage in Part II opens with this same strip, with its own piece highlighted, so you always know where you are.

<div class="ps-map">
<div class="ps-eq ps-eq-all" data-stage="0" role="img" aria-label="The master equation, with the model, the inverse, X transpose and the noise marked as separate pieces"><div class="ps-eq-row"><span class="ps-eq-p" data-p="s" data-label="the model">&#92;(y = X\beta + \varepsilon&#92;)</span><span class="ps-eq-arrow" aria-hidden="true">→</span><span class="ps-eq-fixed">&#92;(\hat{\beta} = \beta+&#92;)</span><span class="ps-eq-p" data-p="a" data-label="geometry">&#92;((X^TX)^{-1}&#92;)</span><span class="ps-eq-p" data-p="b" data-label="features">&#92;(X^T&#92;)</span><span class="ps-eq-p" data-p="c" data-label="noise">&#92;(\varepsilon&#92;)</span></div></div>
<ol class="ps-map-list">
<li data-p="s"><a href="#stage-1"><span class="ps-map-n">1</span><span class="ps-map-op"><b>Write</b> the equation at all</span><span class="ps-map-as">Linearity</span></a></li>
<li data-p="a"><a href="#stage-2"><span class="ps-map-n">2</span><span class="ps-map-op"><b>Invert</b> &#92;((X^TX)&#92;)</span><span class="ps-map-as">Full rank</span></a></li>
<li data-p="b"><a href="#stage-3"><span class="ps-map-n">3</span><span class="ps-map-op"><b>Average</b> &#92;(X^T\varepsilon&#92;)</span><span class="ps-map-as">Strict exogeneity</span></a></li>
<li data-p="c"><a href="#stage-4"><span class="ps-map-n">4</span><span class="ps-map-op"><b>Square</b> &#92;(\varepsilon\varepsilon^T&#92;)</span><span class="ps-map-as">Spherical errors</span></a></li>
<li data-p="c"><a href="#stage-5"><span class="ps-map-n">5</span><span class="ps-map-op"><b>Shape</b> &#92;(\varepsilon&#92;)</span><span class="ps-map-as">Normality</span></a></li>
</ol>
</div>

Part III then breaks each stage the way financial markets do, and Part IV lets you break them yourself.

## Part II · The five assumptions {#part-2}

Five stages, one per assumption. Each stage follows the same order: **the intuition**, then **what it protects**, then **what happens when it breaks**.

<section class="ps-stage" data-stage="1" markdown="1">

### Stage 1 · Linearity {#stage-1}

<div class="ps-eq" data-stage="1" role="img" aria-label="Stage 1 of 5: the model y equals X beta plus epsilon"><div class="ps-eq-row"><span class="ps-eq-p" data-p="s">&#92;(y = X\beta + \varepsilon&#92;)</span><span class="ps-eq-arrow" aria-hidden="true">→</span><span class="ps-eq-fixed">&#92;(\hat{\beta} = \beta+&#92;)</span><span class="ps-eq-p" data-p="a">&#92;((X^TX)^{-1}&#92;)</span><span class="ps-eq-p" data-p="b">&#92;(X^T&#92;)</span><span class="ps-eq-p" data-p="c">&#92;(\varepsilon&#92;)</span></div><div class="ps-eq-cap"><span>Stage 1 of 5 · Permission to <b>write</b> the equation</span></div></div>

Before we ever reach the master equation, we made one move: we replaced $$y$$ with $$X\beta + \varepsilon$$. Linearity is the permission to make that substitution.

<div class="ps-beat ps-beat-intuition" markdown="1">
<span class="ps-beat-label">The intuition</span>

You are approximating the conditional expectation of $$y$$ with a flat hyperplane. "Linear" does *not* mean you can only draw straight lines through raw features. You can put $$x^2$$, $$\log(x)$$, or interaction terms inside $$X$$. It means the output is a linear combination of the *weights* $$\beta$$, and the unmodeled noise $$\varepsilon$$ enters *additively*.

</div>

<div class="ps-beat ps-beat-protects" markdown="1">
<span class="ps-beat-label">What it protects</span>

The structural validity of writing $$y = X\beta + \varepsilon$$ in the first place.

</div>

<div class="ps-beat ps-beat-breaks" markdown="1">
<span class="ps-beat-label">When it breaks</span>

Suppose the true world has a squared term you ignored:

$$y = X\beta + \gamma X^2 + u$$

When you force it into $$y = X\beta + \varepsilon$$, the missing curve gets shoved into the noise: $$\varepsilon = \gamma X^2 + u$$. Now $$\varepsilon$$ isn't pure noise anymore. It has your features hiding inside it, which, as Stage 3 will show, is the most dangerous thing that can happen to a regression. **A misspecified model is an exogeneity violation in disguise.**

</div>

</section>

<section class="ps-stage" data-stage="2" markdown="1">

### Stage 2 · Full rank (no multicollinearity) {#stage-2}

<div class="ps-eq" data-stage="2" role="img" aria-label="Stage 2 of 5: the inverse of X transpose X"><div class="ps-eq-row"><span class="ps-eq-p" data-p="s">&#92;(y = X\beta + \varepsilon&#92;)</span><span class="ps-eq-arrow" aria-hidden="true">→</span><span class="ps-eq-fixed">&#92;(\hat{\beta} = \beta+&#92;)</span><span class="ps-eq-p" data-p="a">&#92;((X^TX)^{-1}&#92;)</span><span class="ps-eq-p" data-p="b">&#92;(X^T&#92;)</span><span class="ps-eq-p" data-p="c">&#92;(\varepsilon&#92;)</span></div><div class="ps-eq-cap"><span>Stage 2 of 5 · Permission to <b>invert</b></span></div></div>

The first piece of the error is $$(X^TX)^{-1}$$. The assumption is $$\operatorname{rank}(X) = k$$: no column is an exact linear combination of the others.

<div class="ps-beat ps-beat-intuition" markdown="1">
<span class="ps-beat-label">The intuition</span>

Geometrically, OLS projects the vector $$y$$ onto the space spanned by your feature columns $$X_1, X_2, \dots, X_k$$, then asks how much of each feature you need to reach that "shadow" $$\hat{y}$$. If $$X_2 = 2X_1$$, the two feature vectors lie on the same line. OLS knows exactly where the shadow lands, but it can't tell whether to put a weight of 10 on $$X_1$$ and 0 on $$X_2$$, or 0 on $$X_1$$ and 5 on $$X_2$$.

</div>

<div class="ps-beat ps-beat-protects" markdown="1">
<span class="ps-beat-label">What it protects</span>

**Identifiability.** Without full column rank, the $$k \times k$$ matrix $$X^TX$$ is singular, and no unique $$\hat{\beta}$$ exists.

</div>

<div class="ps-beat ps-beat-breaks" markdown="1">
<span class="ps-beat-label">When it breaks</span>

The $$^{-1}$$ makes this piece a **denominator**. When features become collinear, $$X^TX$$ collapses toward zero, so its inverse blows up and *magnifies* the noise. Take two standardized features with correlation $$\rho$$:

$$X^T X = \begin{bmatrix} 1 & \rho \\ \rho & 1 \end{bmatrix}, \qquad (X^T X)^{-1} = \frac{1}{1 - \rho^2} \begin{bmatrix} 1 & -\rho \\ -\rho & 1 \end{bmatrix}$$

Watch the multiplier $$\frac{1}{1-\rho^2}$$:

- $$\rho = 0$$: the multiplier is $$1$$. The error stays small.
- $$\rho = 0.999$$: the multiplier is about $$500$$. Every blip of noise is multiplied by 500.
- $$\rho = 1$$: the multiplier is $$\frac{1}{0}$$. NumPy throws `LinAlgError: Singular matrix`.

In plain numbers: if the truth is $$y = 3X_1 + 2X_2 + \varepsilon$$ and $$X_1 = X_2$$, the data only reveal that the weights sum to $$5$$. Both $$(3, 2)$$ and $$(10{,}005,\, -10{,}000)$$ fit equally well. At 99.99% correlation, OLS uses the tiny, mostly-noise difference between the features to pick a split, and you get exactly those absurd weights.

(Strictly, raw $$X^TX$$ is the Gram matrix of sums of squares, not the correlation matrix. Once the regression has an intercept, the same $$\frac{1}{1-\rho^2}$$ factor appears anyway. It's called the **Variance Inflation Factor**.)

</div>

</section>

<section class="ps-stage" data-stage="3" markdown="1">

### Stage 3 · Strict exogeneity {#stage-3}

<div class="ps-eq" data-stage="3" role="img" aria-label="Stage 3 of 5: X transpose epsilon, the alignment between features and noise"><div class="ps-eq-row"><span class="ps-eq-p" data-p="s">&#92;(y = X\beta + \varepsilon&#92;)</span><span class="ps-eq-arrow" aria-hidden="true">→</span><span class="ps-eq-fixed">&#92;(\hat{\beta} = \beta+&#92;)</span><span class="ps-eq-p" data-p="a">&#92;((X^TX)^{-1}&#92;)</span><span class="ps-eq-p" data-p="b">&#92;(X^T&#92;)</span><span class="ps-eq-p" data-p="c">&#92;(\varepsilon&#92;)</span></div><div class="ps-eq-cap"><span>Stage 3 of 5 · <b>Average</b> the error</span></div></div>

Now that the equation exists, does $$\hat{\beta}$$ hit the true $$\beta$$ *on average*? "On average" means taking the expected value, holding the observed $$X$$ fixed:

$$E[\hat{\beta} - \beta \mid X] = E\left[ (X^T X)^{-1} X^T \varepsilon \mid X \right]$$

Since $$X$$ is known inside the conditioning bar, $$(X^TX)^{-1}X^T$$ acts like a constant and pulls straight out:

$$E[\hat{\beta} - \beta \mid X] = (X^T X)^{-1} X^T \, E[\varepsilon \mid X]$$

The matrix in front is not zero. The *only* way the right-hand side becomes zero, so that $$E[\hat{\beta}] = \beta$$, is

$$E[\varepsilon \mid X] = 0.$$

That's **strict exogeneity**: a guarantee about the middle piece, the alignment between your features and the noise.

<div class="ps-beat ps-beat-intuition" markdown="1">
<span class="ps-beat-label">The intuition</span>

Differentiate $$\sum (y_i - x_i^T\hat{\beta})^2$$ and set it to zero. The first-order condition is

$$X^T (y - X\hat{\beta}) = X^T \hat{\varepsilon} = 0.$$

OLS *mechanically forces* its residuals to be perfectly orthogonal to $$X$$. OLS is greedy: if the true, invisible shock $$\varepsilon$$ happens to be correlated with $$X$$, OLS has no way of knowing that correlation came from noise. It credits every bit of covariance with $$X$$ to the signal $$\hat{\beta}$$, so whatever is left over *looks* orthogonal. That's the original sin of OLS, and it's why you can't detect this violation by staring at residuals.

</div>

<div class="ps-beat ps-beat-protects" markdown="1">
<span class="ps-beat-label">What it protects</span>

**Unbiasedness and consistency.** Of all five, this is the one whose failure isn't fixed by more data.

</div>

The name itself is two pieces of jargon. Each deserves unpacking.

#### What "exogenous" means

Break the Greek roots apart: **exo-** means outside, **endo-** means inside, and **-genous** means born. When you write $$y = X\beta + \varepsilon$$, you split the universe into two buckets:

1. $$X$$, **inside your model**: the features you chose to measure.
2. $$\varepsilon$$, **outside your model**: every other force that moves $$y$$. Unmodeled macro shocks, liquidity panics, institutional order flow, human emotion.

Now ask where your feature was born.

- **Exogenous** ("born outside the error system"): whatever generates $$X$$ has no connection to the forces in $$\varepsilon$$. A genie who showed you all your features would give you no clue whether today's invisible error is positive or negative. That's $$E[\varepsilon \mid X] = 0$$.
- **Endogenous** ("entangled with the error system"): the hidden forces in $$\varepsilon$$ also pull the strings of $$X$$. Say $$y$$ is next month's return, $$X$$ is a company's P/E ratio, and $$\varepsilon$$ contains *unmeasured accounting fraud*. The fraud tanks future returns and distorts today's reported earnings at the same time. OLS blames $$X$$ for what $$\varepsilon$$ did.

#### Why "strict": the time-series trap

Compare two conditions for a time series $$t = 1, \dots, T$$:

$$\underbrace{E[\varepsilon_t \mid x_t] = 0}_{\text{contemporaneous}} \qquad \text{vs.} \qquad \underbrace{E[\varepsilon_t \mid x_1, \dots, x_t, \dots, x_T] = 0}_{\text{strict}}$$

The first says today's error is unrelated to *today's* feature. The second says it's unrelated to the feature in the past, the present, **and the future**.

Why would today's shock relate to tomorrow's feature? Because in finance, **today's shock becomes tomorrow's feature.** Take the simplest momentum model:

$$r_t = \beta\, r_{t-1} + \varepsilon_t$$

The feature on day $$t$$ is $$x_t = r_{t-1}$$.

- **Contemporaneous exogeneity holds.** Yesterday's return already happened; today's news can't change it.
- **Strict exogeneity fails.** A surprise earnings shock today, $$\varepsilon_t = +10\%$$, goes straight into today's return $$r_t$$, which *is* tomorrow's feature $$x_{t+1}$$.

Because $$(X^TX)^{-1}$$ mixes all the rows together, that leak creates a finite-sample distortion, the **Hurwicz (or Kendall) bias**. (Its cousin in return-predictability regressions with a persistent predictor is the **Stambaugh bias**.) In a 60-day rolling regression, the slope is biased downward by roughly

$$E[\hat{\beta}] - \beta \approx -\frac{1 + 3\beta}{T},$$

even though $$x_t$$ and $$\varepsilon_t$$ are uncorrelated on the same day. It only washes out as $$T \to \infty$$. That's why *strict* exogeneity is what finite-sample unbiasedness needs.

</section>

<section class="ps-stage" data-stage="4" markdown="1">

### Stage 4 · Spherical errors {#stage-4}

<div class="ps-eq" data-stage="4" role="img" aria-label="Stage 4 of 5: the noise epsilon, squared"><div class="ps-eq-row"><span class="ps-eq-p" data-p="s">&#92;(y = X\beta + \varepsilon&#92;)</span><span class="ps-eq-arrow" aria-hidden="true">→</span><span class="ps-eq-fixed">&#92;(\hat{\beta} = \beta+&#92;)</span><span class="ps-eq-p" data-p="a">&#92;((X^TX)^{-1}&#92;)</span><span class="ps-eq-p" data-p="b">&#92;(X^T&#92;)</span><span class="ps-eq-p" data-p="c">&#92;(\varepsilon&#92;)</span></div><div class="ps-eq-cap"><span>Stage 4 of 5 · <b>Square</b> the noise to get the variance</span></div></div>

Homoskedasticity and no autocorrelation don't show up in $$\hat{\beta} - \beta$$, because by Stage 3 the average error is already zero. They appear the moment you ask a new question: *how much does $$\hat{\beta}$$ bounce around from sample to sample?* That's the variance, and you get it by multiplying the error by its own transpose:

$$\operatorname{Var}(\hat{\beta} \mid X) = E\left[ (\hat{\beta} - \beta)(\hat{\beta} - \beta)^T \mid X \right] = (X^T X)^{-1} X^T \, \underbrace{E[\varepsilon \varepsilon^T \mid X]}_{\Omega} \, X (X^T X)^{-1}$$

The middle piece, $$\Omega$$, is an $$n \times n$$ grid of every error times every other error:

$$\Omega = \begin{bmatrix} E[\varepsilon_1^2] & E[\varepsilon_1 \varepsilon_2] & \cdots & E[\varepsilon_1 \varepsilon_n] \\ E[\varepsilon_2 \varepsilon_1] & E[\varepsilon_2^2] & \cdots & E[\varepsilon_2 \varepsilon_n] \\ \vdots & \vdots & \ddots & \vdots \\ E[\varepsilon_n \varepsilon_1] & E[\varepsilon_n \varepsilon_2] & \cdots & E[\varepsilon_n^2] \end{bmatrix}$$

"Spherical errors" is two statements about this grid:

- **Homoskedasticity**, $$\operatorname{Var}(\varepsilon_i \mid X) = \sigma^2$$: every **diagonal** entry is the same. No row is noisier than another.
- **No autocorrelation**, $$\operatorname{Cov}(\varepsilon_i, \varepsilon_j \mid X) = 0$$ for $$i \neq j$$: every **off-diagonal** entry is zero. Row $$i$$'s surprise says nothing about row $$j$$'s.

<div class="ps-beat ps-beat-intuition" markdown="1">
<span class="ps-beat-label">The intuition</span>

Why does plain OLS minimize an *unweighted* $$\sum \varepsilon_i^2$$, treating row 1 and row 500 as equally trustworthy? Because it assumes every row carries the same amount of fresh, independent information. That's exactly what $$\Omega = \sigma^2 I_n$$ says.

</div>

<div class="ps-beat ps-beat-protects" markdown="1">
<span class="ps-beat-label">What it protects</span>

**Valid standard errors, and efficiency.** In general the variance is a **sandwich**:

$$\operatorname{Var}(\hat{\beta} \mid X) = \underbrace{(X^T X)^{-1}}_{\text{bread}} \; \underbrace{X^T \Omega X}_{\text{meat}} \; \underbrace{(X^T X)^{-1}}_{\text{bread}}$$

Only when $$\Omega = \sigma^2 I_n$$ does the meat become $$\sigma^2 X^TX$$, cancel one slice of bread, and collapse to the textbook formula every regression printout uses:

$$\operatorname{Var}(\hat{\beta} \mid X) = \sigma^2 (X^T X)^{-1}$$

Together with Stages 1–3, this is when the **Gauss–Markov theorem** makes OLS **BLUE**: the Best Linear Unbiased Estimator.

</div>

<div class="ps-beat ps-beat-breaks" markdown="1">
<span class="ps-beat-label">When it breaks</span>

Two things go wrong. The printed t-stats come from the wrong formula, usually too optimistic. And OLS stops being the best linear estimator, because it wastes information by trusting noisy rows as much as clean ones. Part III shows both on real desk examples.

</div>

</section>

<section class="ps-stage" data-stage="5" markdown="1">

### Stage 5 · Normality {#stage-5}

<div class="ps-eq" data-stage="5" role="img" aria-label="Stage 5 of 5: the shape of the noise epsilon"><div class="ps-eq-row"><span class="ps-eq-p" data-p="s">&#92;(y = X\beta + \varepsilon&#92;)</span><span class="ps-eq-arrow" aria-hidden="true">→</span><span class="ps-eq-fixed">&#92;(\hat{\beta} = \beta+&#92;)</span><span class="ps-eq-p" data-p="a">&#92;((X^TX)^{-1}&#92;)</span><span class="ps-eq-p" data-p="b">&#92;(X^T&#92;)</span><span class="ps-eq-p" data-p="c">&#92;(\varepsilon&#92;)</span></div><div class="ps-eq-cap"><span>Stage 5 of 5 · Know the <b>shape</b> of the noise</span></div></div>

The last symbol on the far right is the raw noise vector itself. The assumption is

$$\varepsilon \mid X \sim \mathcal{N}(0, \sigma^2 I_n).$$

We didn't need normality for unbiasedness (Stage 3) or for Gauss–Markov (Stage 4). After four stages we know the *mean* and *variance* of $$\hat{\beta}$$, but not the *shape* of its distribution. Normality supplies the shape.

<div class="ps-beat ps-beat-intuition" markdown="1">
<span class="ps-beat-label">The intuition</span>

$$\hat{\beta}$$ is a fixed matrix times $$\varepsilon$$, a linear combination of the errors. Feed in Gaussian noise and you get a Gaussian estimate. And there's a deeper reason squared errors are the default: the Gaussian density contains $$\exp\!\left(-\frac{\varepsilon_i^2}{2\sigma^2}\right)$$, so maximizing a Gaussian likelihood *is* minimizing $$\sum \varepsilon_i^2$$. Least squares is maximum likelihood under normal errors. That's why Legendre and Gauss squared the errors instead of taking absolute values or fourth powers.

</div>

<div class="ps-beat ps-beat-protects" markdown="1">
<span class="ps-beat-label">What it protects</span>

- **Exact finite-sample inference.** t-stats and F-stats are exact even with 20 data points. (With lots of data and finite variance, the Central Limit Theorem usually rescues you anyway.)
- **The optimality of squared loss.** Squaring residuals is the best choice only when the tails are thin.

</div>

<div class="ps-beat ps-beat-breaks" markdown="1">
<span class="ps-beat-label">When it breaks</span>

With fat tails, a handful of extreme observations take over the fit, because squaring makes a $$10\sigma$$ day count a hundred times as much as a normal one. The CLT can rescue your t-stats in large samples. It cannot rescue the estimator. Part III shows the fix.

</div>

</section>

### Recap: the 15-second checklist {#checklist}

You never have to memorize the list again. Read the equation left to right:

| Stage | Operation | Assumption | What you lose without it |
|---|---|---|---|
| 1 | Substitute $$y = X\beta + \varepsilon$$ | Linearity | The equation itself; missing structure hides in $$\varepsilon$$ |
| 2 | Invert $$(X^TX)^{-1}$$ | Full rank | Identifiability; weights explode by $$\frac{1}{1-\rho^2}$$ |
| 3 | Average $$X^T\varepsilon$$ | Strict exogeneity | Unbiasedness; the slope points the wrong way |
| 4 | Square $$\varepsilon\varepsilon^T$$ | Homoskedasticity + no autocorrelation | Valid standard errors and efficiency |
| 5 | Shape $$\varepsilon$$ | Normality | Exact inference; optimality of squared loss |

## Part III · The autopsy {#part-3}

In quantitative finance, all of these assumptions are violated, usually at the same time. Here's how each violation shows up on a desk, what it does to $$\hat{\beta}$$, and how practitioners re-engineer the estimator. Each deep dive follows the same order: **where you'll meet it**, **what breaks**, and **the fix**.

| Breaks | Violation | Where it shows up | What breaks in $$\hat{\beta}$$ | The fix |
|---|---|---|---|---|
| 2 | Near-multicollinearity | Overlapping signals (5d, 10d, 20d momentum) | Still unbiased, but variance explodes | Ridge, PCA, orthogonalization |
| 3 | Exogeneity | Omitted risk factors, noisy features, price impact | Biased; more data won't fix it | FWL residualization, IV / 2SLS, Kalman filters |
| 4 | Non-spherical errors | Volatility clustering, overlapping horizons | Unbiased but inefficient; fake t-stats | Newey–West / clustered SEs; WLS / GLS |
| 5 | Heavy tails | Flash crashes, earnings jumps, bad ticks | One extreme point hijacks the slope | Huber loss, quantile regression |
| all | Non-stationarity | Regime shifts, alpha decay | A static $$\hat{\beta}$$ averages over dead regimes | Exponential weighting, Kalman state models |

The last row is the assumption *underneath* all five: that there's one fixed $$\beta$$ to estimate. That one deserves its own post. The other four get a deep dive each.

<section class="ps-stage" data-stage="2" markdown="1">

### Breaking stage 2 · Near-multicollinearity {#break-2}

<div class="ps-beat ps-beat-where" markdown="1">
<span class="ps-beat-label">Where you'll meet it</span>

You rarely put two *identical* columns into $$X$$. Instead you put thirty correlated alpha signals into one regression: 5-day reversal, 10-day reversal, volume-weighted reversal.

</div>

<div class="ps-beat ps-beat-autopsy" markdown="1">
<span class="ps-beat-label">What breaks</span>

Take the eigendecomposition $$X^TX = V\Lambda V^T$$. Then $$(X^TX)^{-1} = V\Lambda^{-1}V^T$$, and the total variance of the weights is

$$\sum_{j=1}^k \operatorname{Var}(\hat{\beta}_j \mid X) = \sigma^2 \operatorname{Tr}\left((X^T X)^{-1}\right) = \sigma^2 \sum_{j=1}^k \frac{1}{\lambda_j}.$$

Every eigenvalue contributes its *reciprocal*. For two standardized features the eigenvalues are $$1 \pm \rho$$. At $$\rho = 0.98$$, $$\lambda_{\min} = 0.02$$ and $$1/\lambda_{\min} = 50$$. At $$\rho = 0.9999$$, $$1/\lambda_{\min} = 10{,}000$$. The matrix is still invertible, so your code throws no warning.

The estimator stays unbiased and the in-sample fit looks great, but the weights go wild: $$+500$$ on Signal A, $$-499$$ on Signal B, fitting tiny in-sample noise. The day their correlation drops from $$0.98$$ to $$0.85$$, that spread blows up the portfolio.

</div>

<div class="ps-beat ps-beat-fix" markdown="1">
<span class="ps-beat-label">The fix: Ridge regression</span>

Trade a little bias for a large cut in variance:

$$\min_{\beta} \; \Vert y - X\beta \Vert_2^2 + \gamma \Vert \beta \Vert_2^2 \quad\Longrightarrow\quad \hat{\beta}_{\text{Ridge}} = (X^T X + \gamma I)^{-1} X^T y$$

Adding $$\gamma I$$ shifts every eigenvalue from $$\lambda_j$$ to $$\lambda_j + \gamma$$, so the total variance becomes $$\sigma^2 \sum_j \frac{\lambda_j}{(\lambda_j + \gamma)^2}$$. It stays bounded however close $$\lambda_j$$ gets to zero: a floor under the eigenvalues so they can't explode on inversion.

</div>

</section>

<section class="ps-stage" data-stage="3" markdown="1">

### Breaking stage 3 · Exogeneity, the silent killer {#break-3}

Violating exogeneity is the most dangerous failure in quantitative research because **more data does not help**. As $$N \to \infty$$, $$\hat{\beta}$$ converges confidently to the wrong number.

<div class="ps-beat ps-beat-where" markdown="1">
<span class="ps-beat-label">Where you'll meet it</span>

**Omitted risk factors.** Suppose returns are truly $$y = X_1 \beta_1 + X_2 \beta_2 + u$$, where $$X_1$$ is your alpha signal and $$X_2$$ is market or sector beta, and you regress on $$X_1$$ alone:

$$E[\hat{\beta}_1] = \beta_1 + \underbrace{(X_1^T X_1)^{-1} X_1^T X_2 \, \beta_2}_{\text{omitted variable bias}}$$

Unless your signal is orthogonal to the factor you left out, its weight absorbs the factor's return. You think you found alpha. Your PM sees that you went long high-beta tech.

**Noisy features.** If your feature is a noisy estimate, $$\tilde{X} = X + \eta$$ (a rolling beta, a sentiment score), the error becomes $$\varepsilon - \beta\eta$$, correlated with $$\tilde{X}$$. The slope shrinks toward zero by the signal-to-noise ratio:

$$\hat{\beta}_{\text{OLS}} \xrightarrow{p} \beta \left(\frac{\sigma_X^2}{\sigma_X^2 + \sigma_\eta^2}\right)$$

**Simultaneity.** Regress 1-minute price changes $$\Delta P_t$$ on order flow $$Q_t$$ to estimate Kyle's lambda, and the estimate is biased: traders also send order flow *in response to* price moves. Causality runs both ways.

</div>

<div class="ps-beat ps-beat-fix" markdown="1">
<span class="ps-beat-label">The fix</span>

- **Omitted factors → Frisch–Waugh–Lovell.** Strip the known factors out of your signal first and keep the residual, $$\tilde{X}_1 = \left(I - X_2(X_2^T X_2)^{-1} X_2^T\right) X_1$$. Now $$\tilde{X}_1^T X_2 = 0$$ by construction.
- **Noisy features → model the measurement.** Estimate the latent feature with a state-space model and Kalman filter, or use total least squares.
- **Simultaneity → instrumental variables.** Find a variable that moves $$X$$ but has no direct path to $$\varepsilon$$, and use two-stage least squares.

</div>

</section>

<section class="ps-stage" data-stage="4" markdown="1">

### Breaking stage 4 · Non-spherical errors {#break-4}

<div class="ps-beat ps-beat-where" markdown="1">
<span class="ps-beat-label">Where you'll meet it</span>

**Off-diagonals: overlapping horizons.** Regress 10-day forward returns on today's signal with daily data, and today's 10-day return shares 9 of its 10 days with tomorrow's. Even with white-noise daily returns, the residuals follow an MA(9) process with strong positive autocorrelation.

**Diagonals: heteroskedasticity.** Across 3,000 stocks, a distressed small-cap biotech has ten times the idiosyncratic variance of Johnson & Johnson. Over time, a VIX-at-45 month is far noisier than a VIX-at-12 month.

</div>

<div class="ps-beat ps-beat-autopsy" markdown="1">
<span class="ps-beat-label">What breaks</span>

1. **Your standard errors lie.** Overlapping 10-day returns over 1,000 days give roughly $$1{,}000/10 = 100$$ independent observations, not 1,000. When the signal is slow-moving, as most real signals are, naive OLS shrinks the standard error by about $$\sqrt{10} \approx 3.16$$. A useless signal with a true t-stat of 0.9 prints about 2.85.
2. **Your slope is inefficient.** A micro-cap with a 15% residual pulls with 225 units of squared error; a mega-cap with 1% pulls with 1. OLS bends the line to appease the noisiest names and days.

</div>

<div class="ps-beat ps-beat-fix" markdown="1">
<span class="ps-beat-label">The fix</span>

**For inference, keep the whole sandwich.** Use $$(X^TX)^{-1}(X^T\hat{\Omega}X)(X^TX)^{-1}$$ with a **White** estimate of $$\hat{\Omega}$$ for heteroskedasticity, **Newey–West** for autocorrelation, or **clustered / Fama–MacBeth** errors for cross-sections.

**For the estimator, use GLS.** Multiply the regression by $$\Omega^{-1/2}$$:

$$\Omega^{-1/2} y = (\Omega^{-1/2} X)\beta + \Omega^{-1/2} \varepsilon$$

The new error has covariance $$\Omega^{-1/2}\,\Omega\,\Omega^{-1/2} = I_n$$: spherical again. OLS on the transformed data is **Generalized Least Squares**,

$$\hat{\beta}_{\text{GLS}} = (X^T \Omega^{-1} X)^{-1} X^T \Omega^{-1} y.$$

Factor models like Barra use the special case **Weighted Least Squares**, with $$\Omega^{-1} = \operatorname{diag}(1/\hat{\sigma}_1^2, \dots, 1/\hat{\sigma}_n^2)$$, so noisy names don't corrupt the factor returns.

</div>

</section>

<section class="ps-stage" data-stage="5" markdown="1">

### Breaking stage 5 · Heavy tails {#break-5}

<div class="ps-beat ps-beat-where" markdown="1">
<span class="ps-beat-label">Where you'll meet it</span>

Flash crashes, earnings gaps, bad ticks. Daily equity returns look roughly like a Student-$$t$$ with about 3 degrees of freedom. The textbook defense is that Gauss–Markov still makes OLS BLUE without normality. The trap is the **L** in BLUE: best among *linear* estimators. With fat tails every linear estimator is bad, and a nonlinear one beats them all.

</div>

<div class="ps-beat ps-beat-autopsy" markdown="1">
<span class="ps-beat-label">What breaks</span>

The gradient of the OLS loss is

$$\nabla_\beta \mathcal{L}(\beta) = -\sum_{i=1}^n \underbrace{(y_i - x_i^T \beta)}_{\psi(\varepsilon_i) \,=\, \varepsilon_i} x_i = 0.$$

$$\psi$$ is the **influence function**: how hard one observation pulls on $$\hat{\beta}$$. For OLS it's $$\varepsilon_i$$ itself, which is unbounded. One $$10\sigma$$ bad tick pulls ten times harder than a normal day, and OLS tilts the whole line away from the 99.9% of clean data to quiet it.

</div>

<div class="ps-beat ps-beat-fix" markdown="1">
<span class="ps-beat-label">The fix: Huber loss</span>

Swap squared loss for the **Huber loss**, solved by iteratively reweighted least squares:

$$\rho_\delta(\varepsilon) = \begin{cases} \frac{1}{2}\varepsilon^2 & \text{if } \lvert \varepsilon \rvert \le \delta \\[4pt] \delta\left(\lvert \varepsilon \rvert - \frac{1}{2}\delta\right) & \text{if } \lvert \varepsilon \rvert > \delta \end{cases}$$

Inside $$\pm\delta$$ its influence function is $$\varepsilon$$, exactly like OLS, so you keep full efficiency on clean data. Outside, it caps at $$\pm\delta$$. A $$20\sigma$$ earnings shock pulls no harder than a $$\delta$$-sized move.

</div>

</section>

## Part IV · Break OLS yourself {#part-4}

The simulator generates data from a model where you control the truth, then fits three estimators: **OLS**, **WLS** (the heteroskedasticity fix) and **Huber** (the fat-tail fix). It reports three t-stats for the OLS slope: **naive**, **White**, and **Newey–West**.

The key button is **Run 400 backtests**. It simulates 400 datasets where the signal is *completely useless* ($$\beta = 0$$) and counts how often each t-stat calls it significant at 5%. Honest inference gives about 5%.

<div id="ols-lab-mount"></div>
<script src="/assets/js/ols-lab.js" defer></script>

What to try:

<div class="ps-trylist" markdown="1">

- **Overlapping 10-day returns.** The naive t-stat calls a useless signal significant about 45% of the time. White barely helps, because it fixes only the diagonal of $$\Omega$$. Newey–West brings it down a lot but not to 5%: with 250 rows you have about 25 independent observations, and no formula conjures information that isn't there.
- **Heteroskedastic.** The naive t-stat over-rejects (about 20%); White brings it back near 5%. All three slopes stay roughly unbiased, but WLS has the smallest typical error. That's efficiency.
- **Bad tick.** One corrupted print at the most extreme signal. OLS pivots; Huber barely moves. In the backtests that single point makes the naive t-stat find a "signal" more than half the time, and OLS's typical error is about three times Huber's.
- **Fat tails.** No single disaster, just Student-$$t$$ noise. Every fit looks fine, but Huber's typical error is about 30% smaller than OLS's: BLUE's "linear" fine print.
- **Clean world.** Everything agrees. It's the only world where the default printout tells the whole truth.

</div>

## Coda · The takeaway {#coda}

If someone asks, "What are the assumptions of OLS, and which one matters most?", don't recite a list. Write the error equation,

$$\hat{\beta} - \beta = (X^T X)^{-1} X^T \varepsilon,$$

and rank the assumptions by the damage their failure does:

1. **Exogeneity matters most**, because its failure biases $$\hat{\beta}$$ even with infinite data, and you can't see it in the residuals.
2. **Heavy tails come next** in low signal-to-noise data like returns, because the unbounded squared-loss gradient lets a few corrupted ticks dictate your weights.
3. **Non-spherical errors come third**, because autocorrelation and volatility clustering manufacture fake t-stats that trick researchers into deploying noise.

Collinearity and normality matter too, but their damage is visible and fixable: unstable weights you can shrink, and inference you can rescue with more data.

The list was never the point. The equation is. Each assumption is just the answer to "what do I need to be true to take the next step?"
