---
layout: post
title: "Every Linear Regression Assumption Lives in One Equation"
date: 2026-10-18
description: "The assumptions of OLS, derived from a single line of algebra: what each one protects, what breaks when markets violate it, and how quants fix it. With an interactive lab."
tags: [statistics, econometrics, quant]
math: true
---

Linear regression is the first model everyone learns and the last one most people actually understand.

I have been through it more times than I can count: in undergrad, in my master's, in interview prep, at work. Every textbook does the same thing. It derives $$\hat{\beta} = (X^TX)^{-1}X^Ty$$, and then it hands you a list. Linearity. Exogeneity. Homoskedasticity. No autocorrelation. No multicollinearity. Normality. Six rules, stated as if they all do the same job, with no explanation of *where they come from*.

So I did what everyone does. I memorized the list. And it never stuck, because a list you can't derive is a list you can't reason with. I could recite "homoskedasticity," but I couldn't tell you which violation is a minor annoyance and which one quietly destroys your model. I couldn't tell you why normality is on the list at all when half the books say you don't need it. And the word "exogeneity" meant nothing to me beyond "a thing you're supposed to say."

This post is the explanation that finally made it click for me. The idea is simple:

> **Every assumption of linear regression exists to control one piece of a single equation.** Read that equation from left to right, and the assumptions fall out in order, each one unlocking the next step of the math.

Once you see it this way, you don't memorize the list anymore. You can rebuild it on a napkin, rank the assumptions by how much damage their failure does, and know what to reach for when one of them breaks. At the end there's an interactive lab where you can break OLS yourself and watch what happens.

---

## The whole picture, in plain English

Before any algebra, here is the story.

You have data: a column of outcomes $$y$$ (say, next week's stock returns) and a table of features $$X$$ (say, a momentum signal, a value signal, a market beta). You believe the world works like this: the outcome is a weighted sum of the features, plus some noise you can't see.

Your goal is to recover the *true* weights $$\beta$$. OLS gives you an *estimate* $$\hat{\beta}$$.

The key move is to write the estimate as **"the truth, plus an error"**, and then stare at the error. That error term is a product of three ingredients. Each assumption is a guarantee about one of those ingredients. When a guarantee fails, you can point to exactly which ingredient misbehaved and exactly what it costs you: an equation you can't compute, a slope pointing the wrong way, or error bars that lie.

That's the entire post. Now let's build it.

---

## One equation to rule them all

Suppose the true **data generating process** (DGP), the way the world actually produces your data, is

$$y = X\beta + \varepsilon$$

where $$y$$ is an $$n \times 1$$ vector of outcomes, $$X$$ is an $$n \times k$$ matrix of features, $$\beta$$ is the $$k \times 1$$ vector of true weights, and $$\varepsilon$$ is the $$n \times 1$$ vector of noise: everything that moves $$y$$ that isn't in your spreadsheet.

OLS picks the weights that minimize the sum of squared residuals,

$$\min_{\hat{\beta}} \; \Vert y - X\hat{\beta} \Vert_2^2,$$

and the solution is the familiar projection formula. Now watch what happens when we plug the *true* $$y$$ into it.

**Step 1.** Start with the standard OLS formula:

$$\hat{\beta} = (X^T X)^{-1} X^T y$$

**Step 2.** Substitute the true data generating process, $$y = X\beta + \varepsilon$$:

$$\hat{\beta} = (X^T X)^{-1} X^T (X\beta + \varepsilon)$$

**Step 3.** Multiply it out across the parentheses:

$$\hat{\beta} = (X^T X)^{-1} (X^T X)\, \beta + (X^T X)^{-1} X^T \varepsilon$$

**Step 4.** A matrix times its own inverse is the identity, $$(X^T X)^{-1}(X^T X) = I$$, so we are left with:

$$\hat{\beta} = \beta + \underbrace{(X^T X)^{-1} X^T \varepsilon}_{\text{the estimation error}}$$

This is the master equation for everything that follows. Your estimate equals the truth, plus an error term. And that error term has exactly three ingredients:

| Piece | What it is | When it misbehaves |
|---|---|---|
| $$(X^T X)^{-1}$$ | The inverse of the feature covariance | Features are collinear, so the inverse explodes |
| $$X^T \varepsilon$$ | The alignment between your features and the noise | An omitted variable or look-ahead leaks into the noise |
| $$\varepsilon$$ | The noise vector itself | Fat tails, changing variance, or autocorrelation |

Every assumption of linear regression is a guarantee about one of these three pieces. Before we walk through them in order, one detour, because it trips up almost everyone (it tripped me up).

---

## Detour: what does it mean for $$(X^T X)^{-1}$$ to "break"?

My first instinct, looking at the error term, was: if $$X^TX$$ goes to zero, doesn't the error vanish? It's the opposite.

Because of the $$^{-1}$$ exponent, $$(X^T X)^{-1}$$ is a **denominator**, not a numerator. Think of ordinary numbers first: the inverse of $$a$$ is $$a^{-1} = \frac{1}{a}$$. If $$a = 0.00001$$, then $$a^{-1}$$ doesn't become zero; it becomes $$100{,}000$$. When your features become collinear, $$X^TX$$ collapses toward zero, so its inverse blows up toward infinity and **magnifies the noise** $$\varepsilon$$ by a massive factor.

### Dividing by zero, not multiplying by zero

Take two standardized features $$X_1$$ and $$X_2$$ with correlation $$\rho$$. (Scaled the right way, $$X^TX$$ becomes their correlation matrix. I'll justify that in a moment.)

$$X^T X = \begin{bmatrix} 1 & \rho \\ \rho & 1 \end{bmatrix}$$

Inverting a $$2 \times 2$$ matrix puts its determinant, $$1 - \rho^2$$, in the denominator:

$$(X^T X)^{-1} = \frac{1}{1 - \rho^2} \begin{bmatrix} 1 & -\rho \\ -\rho & 1 \end{bmatrix}$$

Plug that into the master equation:

$$\hat{\beta} = \beta + \frac{1}{1 - \rho^2} \begin{bmatrix} 1 & -\rho \\ -\rho & 1 \end{bmatrix} X^T \varepsilon$$

Now watch the multiplier $$\frac{1}{1-\rho^2}$$ as the features become collinear:

- $$\rho = 0$$ (uncorrelated): the multiplier is $$\frac{1}{1 - 0} = 1$$. The error stays small.
- $$\rho = 0.999$$ (highly collinear): the multiplier is $$\frac{1}{1 - 0.999^2} \approx 500$$. Every tiny blip of noise gets multiplied by 500.
- $$\rho = 1$$ (perfectly collinear): the multiplier is $$\frac{1}{0}$$. Undefined.

So collinearity doesn't make the error vanish. It makes it explode.

### Why you don't even get $$\beta$$ when $$\rho = 1$$

There's a second catch. Look back at Step 3 of the derivation:

$$\hat{\beta} = (X^T X)^{-1} (X^T X)\, \beta + (X^T X)^{-1} X^T \varepsilon$$

We were allowed to replace $$(X^T X)^{-1}(X^T X)\,\beta$$ with a clean $$\beta$$ only because the matrix was invertible, the same way $$\frac{1}{5} \times 5 \times \beta = \beta$$. If the features are perfectly collinear, $$X^TX$$ behaves like the number $$0$$, and $$\frac{0}{0}$$ is undefined. In practice you never even get that far: ask NumPy for $$(X^TX)^{-1}$$ and it throws `LinAlgError: Singular matrix`.

### The ten-second intuition

Suppose the true formula driving returns is

$$y = 3X_1 + 2X_2 + \varepsilon,$$

so the true weights are $$\beta_1 = 3$$ and $$\beta_2 = 2$$. Now suppose $$X_1$$ and $$X_2$$ are the same feature. The equation collapses to

$$y = (3 + 2)X_1 + \varepsilon = 5X_1 + \varepsilon.$$

OLS can only learn that the two weights add up to $$5$$. Both $$(\hat{\beta}_1, \hat{\beta}_2) = (3, 2)$$ and $$(10{,}005,\; -10{,}000)$$ fit the data equally well.

If the features are 99.99% correlated instead of 100%, they differ by a sliver, and that sliver is almost entirely noise. OLS uses it anyway to decide how to split the weight, which is how you end up with $$\hat{\beta}_1 = +10{,}005$$ and $$\hat{\beta}_2 = -10{,}000$$.

### Wait, $$X^TX$$ isn't the correlation matrix

When I first saw $$X^T X = \begin{bmatrix} 1 & \rho \\ \rho & 1 \end{bmatrix}$$, my immediate objection was: correlation requires subtracting means and dividing by standard deviations. Raw $$X^TX$$ does none of that. It's the **Gram matrix**, the raw sums of squares and cross-products:

$$X^T X = \begin{bmatrix} \sum_{i=1}^n x_{i1}^2 & \sum_{i=1}^n x_{i1} x_{i2} \\ \sum_{i=1}^n x_{i1} x_{i2} & \sum_{i=1}^n x_{i2}^2 \end{bmatrix}$$

The objection is right. But the $$\frac{1}{1-\rho^2}$$ blow-up survives anyway, in three steps.

**Step 1: the intercept subtracts the means for you.** A regression with an intercept,

$$y = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \varepsilon,$$

has a column of 1s inside $$X$$. By the **Frisch–Waugh–Lovell (FWL) theorem**, including that column is equivalent to projecting $$X_1$$ and $$X_2$$ onto the space orthogonal to the vector of 1s, which is exactly subtracting each feature's sample mean. So the block of the matrix that solves for the slopes uses centered features $$\tilde{x}_{ij} = x_{ij} - \bar{x}_j$$:

$$\tilde{X}^T \tilde{X} = \begin{bmatrix} \sum (x_{i1} - \bar{x}_1)^2 & \sum (x_{i1} - \bar{x}_1)(x_{i2} - \bar{x}_2) \\ \sum (x_{i1} - \bar{x}_1)(x_{i2} - \bar{x}_2) & \sum (x_{i2} - \bar{x}_2)^2 \end{bmatrix}$$

That is just $$(n-1)$$ times the sample covariance matrix:

$$\tilde{X}^T \tilde{X} = (n - 1) \begin{bmatrix} s_1^2 & \operatorname{Cov}(X_1, X_2) \\ \operatorname{Cov}(X_1, X_2) & s_2^2 \end{bmatrix}$$

**Step 2: correlation appears even without standardizing.** Pearson correlation is $$\rho = \frac{\operatorname{Cov}(X_1, X_2)}{s_1 s_2}$$, so $$\operatorname{Cov}(X_1, X_2) = \rho\, s_1 s_2$$:

$$\tilde{X}^T \tilde{X} = (n - 1) \begin{bmatrix} s_1^2 & \rho s_1 s_2 \\ \rho s_1 s_2 & s_2^2 \end{bmatrix}$$

Its determinant (up to the $$(n-1)^2$$ factor) is

$$s_1^2 s_2^2 - (\rho s_1 s_2)^2 = s_1^2 s_2^2 (1 - \rho^2),$$

so the inverse is

$$(\tilde{X}^T \tilde{X})^{-1} = \frac{1}{(n - 1)(1 - \rho^2)} \begin{bmatrix} \frac{1}{s_1^2} & -\frac{\rho}{s_1 s_2} \\ -\frac{\rho}{s_1 s_2} & \frac{1}{s_2^2} \end{bmatrix}$$

The $$(1 - \rho^2)$$ is still sitting in the denominator. It doesn't matter if $$X_1$$ has mean 500 and standard deviation 20 while $$X_2$$ has mean $$-10$$ and standard deviation 0.05. As long as the regression has an intercept, every slope's variance gets divided by $$1-\rho^2$$. That multiplier has a famous name: $$\frac{1}{1-\rho^2}$$ is the **Variance Inflation Factor (VIF)**.

**Step 3: why quants standardize anyway.** If you z-score each feature, $$Z_j = \frac{X_j - \bar{X}_j}{s_j}$$, and scale by $$\frac{1}{\sqrt{n-1}}$$, the matrix collapses to the pure correlation matrix:

$$Z^T Z = \begin{bmatrix} 1 & \rho \\ \rho & 1 \end{bmatrix}$$

On a real desk you almost always z-score signals before regressing, especially before Ridge or LASSO. Otherwise a penalty like $$\gamma(\beta_1^2 + \beta_2^2)$$ would punish a feature just for being measured in basis points instead of decimals.

---

## Reading the equation left to right: the five assumptions

Here's the move that made everything click. Treat the master equation as an assembly line. Each assumption is a permission slip that unlocks the next mathematical operation:

1. **Write** the equation at all → *Linearity*
2. **Invert** $$(X^TX)$$ → *Full rank (no multicollinearity)*
3. **Average** the error → *Strict exogeneity*
4. **Square** the error to get its variance → *Spherical errors (homoskedasticity + no autocorrelation)*
5. **Shape** the error's distribution → *Normality*

Let's go station by station.

### Stage 1: Permission to write the equation (Linearity)

Before we ever reach $$\hat{\beta} = \beta + (X^TX)^{-1}X^T\varepsilon$$, we made one move: we replaced $$y$$ with $$X\beta + \varepsilon$$. Linearity is the permission to make that substitution.

**The intuition.** You are approximating the conditional expectation of $$y$$ with a flat hyperplane. "Linear" does *not* mean you can only draw straight lines through raw features. You can put $$x^2$$, $$\log(x)$$, or interaction terms inside $$X$$. It means the output is a linear combination of the *weights* $$\beta$$, and the unmodeled noise $$\varepsilon$$ enters *additively*.

**What it protects.** The structural validity of writing $$y = X\beta + \varepsilon$$ in the first place.

**What happens when it breaks.** Suppose the true world has a squared term you ignored:

$$y = X\beta + \gamma X^2 + u$$

When you force it into $$y = X\beta + \varepsilon$$, the missing curve gets shoved into the noise: $$\varepsilon = \gamma X^2 + u$$. Now $$\varepsilon$$ isn't pure noise anymore. It has your features hiding inside it, which, as we'll see in Stage 3, is the most dangerous thing that can happen to a regression. A misspecified model is an exogeneity violation in disguise.

### Stage 2: Permission to divide (Full rank / no perfect multicollinearity)

Now we have the master equation, written as an error:

$$\hat{\beta} - \beta = (X^T X)^{-1} X^T \varepsilon$$

The first block is $$(X^TX)^{-1}$$. The assumption is $$\operatorname{rank}(X) = k$$: no column is an exact linear combination of the others.

**The intuition.** Geometrically, OLS projects the vector $$y$$ onto the space spanned by your feature columns $$X_1, X_2, \dots, X_k$$, then asks how much of each feature you need to reach that "shadow" $$\hat{y}$$. If $$X_2 = 2X_1$$, the two feature vectors lie on the same line. OLS knows exactly where the shadow lands, but it can't tell whether to put a weight of 10 on $$X_1$$ and 0 on $$X_2$$, or 0 on $$X_1$$ and 5 on $$X_2$$.

**What it protects.** *Identifiability.* Without full column rank, the $$k \times k$$ matrix $$X^TX$$ is singular, and no unique $$\hat{\beta}$$ exists. With *near* collinearity, a unique answer exists but, as the detour showed, it's inflated by $$\frac{1}{1-\rho^2}$$.

### Stage 3: Centering the bullseye (Strict exogeneity)

Now that the equation exists, we want to know whether $$\hat{\beta}$$ hits the true $$\beta$$ *on average*. "On average" means taking the expected value, holding the observed $$X$$ fixed:

$$E[\hat{\beta} - \beta \mid X] = E\left[ (X^T X)^{-1} X^T \varepsilon \mid X \right]$$

Since $$X$$ is known inside the conditioning bar, $$(X^TX)^{-1}X^T$$ acts like a constant and pulls straight out of the expectation:

$$E[\hat{\beta} - \beta \mid X] = (X^T X)^{-1} X^T \, E[\varepsilon \mid X]$$

The matrix in front is not zero. The *only* way the right-hand side becomes zero, so that $$E[\hat{\beta}] = \beta$$, is

$$E[\varepsilon \mid X] = 0.$$

That's **strict exogeneity**, also called zero conditional mean. It's the assumption on the middle piece, $$X^T\varepsilon$$: the alignment between your features and the noise.

**Why it matters so much: the "original sin" of OLS.** When you differentiate $$\sum (y_i - x_i^T\hat{\beta})^2$$ and set it to zero, the first-order condition is

$$X^T (y - X\hat{\beta}) = X^T \hat{\varepsilon} = 0.$$

In plain English, OLS *mechanically forces* its residuals $$\hat{\varepsilon}$$ to be perfectly orthogonal to $$X$$. OLS is greedy. If the true, invisible shock $$\varepsilon$$ happens to be correlated with $$X$$, OLS has no way of knowing that correlation came from noise. It attributes every bit of covariance with $$X$$ to the signal $$\hat{\beta}$$, so that whatever is left over *looks* orthogonal. You can't test for this violation by looking at the residuals, because OLS made them orthogonal by construction.

**What it protects.** Unbiasedness and consistency. Of all five, this is the one whose failure isn't fixed by more data.

But what does "exogeneity" actually *mean*? And why "strict"? These two words deserve their own section.

#### What "exogenous" means

Break the Greek roots apart:

- **Exo-** = outside, **-genous** = born or generated.
- **Endo-** = inside, **-genous** = born or generated.

When you write down $$y = X\beta + \varepsilon$$, you split the universe into two buckets:

1. $$X$$, **inside your model**: the features you chose to measure and put in your spreadsheet.
2. $$\varepsilon$$, **outside your model**: every other force that moves $$y$$ but isn't in your spreadsheet. Unmodeled macro shocks, liquidity panics, institutional order flow, human emotion.

Now ask: *where was your feature $$X$$ born?*

- **$$X$$ is exogenous** ("born outside the error system") when whatever generates $$X$$ has no connection to the forces inside $$\varepsilon$$. If a genie let you peek at all your features, it would give you no clue whether today's invisible error is positive or negative. Mathematically, $$E[\varepsilon \mid X] = 0$$.
- **$$X$$ is endogenous** ("entangled with the error system") when the hidden forces in $$\varepsilon$$ also pull the strings of $$X$$. Say $$y$$ is next month's return, $$X$$ is a company's P/E ratio, and $$\varepsilon$$ contains *unmeasured accounting fraud*. The fraud simultaneously tanks future returns ($$y$$) and distorts today's reported earnings ($$X$$). Because $$X$$ and $$\varepsilon$$ move together, OLS blames $$X$$ for what $$\varepsilon$$ did.

#### Why the word "strict"? The time-series trap

Compare two conditions for a time series $$t = 1, 2, \dots, T$$:

**Contemporaneous exogeneity:**

$$E[\varepsilon_t \mid x_t] = 0$$

"Today's error is unrelated to today's feature."

**Strict exogeneity:**

$$E[\varepsilon_t \mid x_1, x_2, \dots, x_t, \dots, x_T] = 0$$

"Today's error is unrelated to the feature in the past, the present, *and the future*." The entire matrix $$X$$.

Why on earth would today's shock be related to *tomorrow's* feature? Because in finance, **today's shock becomes tomorrow's feature.**

Take the simplest momentum or mean-reversion model, predicting today's return from yesterday's:

$$r_t = \beta\, r_{t-1} + \varepsilon_t$$

Your feature on day $$t$$ is $$x_t = r_{t-1}$$. Test both conditions:

- **Contemporaneous exogeneity holds.** Yesterday's return already happened. A surprise news shock today can't travel back in time and change it.
- **Strict exogeneity fails.** Suppose a surprise earnings announcement hits today, so $$\varepsilon_t = +10\%$$. That shock goes straight into today's return $$r_t$$. Now step forward one day. Tomorrow's feature is $$x_{t+1} = r_t$$. Today's error is baked directly into tomorrow's feature.

Why does that break OLS? Because $$(X^TX)^{-1}$$ mixes all the rows $$t = 1, \dots, T$$ together. OLS divides by a sum of squares that includes $$x_{t+1}$$, which contains $$\varepsilon_t$$. That leak creates a well-known finite-sample distortion, the **Hurwicz (or Kendall) bias**. (Its cousin in return-predictability regressions with a persistent predictor, like the dividend yield, is the **Stambaugh bias**.) In a short window, say a 60-day rolling regression, the OLS slope in $$r_t = \beta r_{t-1} + \varepsilon_t$$ is biased downward by roughly

$$E[\hat{\beta}] - \beta \approx -\frac{1 + 3\beta}{T},$$

even though $$x_t$$ and $$\varepsilon_t$$ are uncorrelated on the same day. The bias washes out only as $$T \to \infty$$. That's why *strict* exogeneity, across the whole matrix $$X$$, is what you need for OLS to be unbiased in finite samples.

### Stage 4: Measuring the spread (Spherical errors)

Where do homoskedasticity and no autocorrelation come from? They don't show up in $$\hat{\beta} - \beta$$ directly, because by Stage 3 the average error is already zero. They appear the moment you ask a different question: *how much does $$\hat{\beta}$$ bounce around from sample to sample?*

That's the variance. In linear algebra you get it by multiplying the error by its own transpose and taking the expectation:

$$\operatorname{Var}(\hat{\beta} \mid X) = E\left[ (\hat{\beta} - \beta)(\hat{\beta} - \beta)^T \mid X \right]$$

Plug the master equation into both parentheses:

$$\operatorname{Var}(\hat{\beta} \mid X) = E\left[ \left((X^T X)^{-1} X^T \varepsilon\right) \left(\varepsilon^T X (X^T X)^{-1}\right) \mid X \right]$$

Pull the known $$X$$ matrices outside, leaving only the unknown errors inside:

$$\operatorname{Var}(\hat{\beta} \mid X) = (X^T X)^{-1} X^T \, E[\varepsilon \varepsilon^T \mid X] \, X (X^T X)^{-1}$$

Look at the middle piece. Since $$\varepsilon$$ is an $$n \times 1$$ column and $$\varepsilon^T$$ is a $$1 \times n$$ row, their product is an $$n \times n$$ grid of every error times every other error. Call it $$\Omega$$:

$$\Omega = E[\varepsilon \varepsilon^T \mid X] = \begin{bmatrix} E[\varepsilon_1^2] & E[\varepsilon_1 \varepsilon_2] & \cdots & E[\varepsilon_1 \varepsilon_n] \\ E[\varepsilon_2 \varepsilon_1] & E[\varepsilon_2^2] & \cdots & E[\varepsilon_2 \varepsilon_n] \\ \vdots & \vdots & \ddots & \vdots \\ E[\varepsilon_n \varepsilon_1] & E[\varepsilon_n \varepsilon_2] & \cdots & E[\varepsilon_n^2] \end{bmatrix}$$

The two halves of "spherical errors" are statements about this grid:

- **Homoskedasticity**, $$\operatorname{Var}(\varepsilon_i \mid X) = \sigma^2$$: every **diagonal** entry is the same constant. No row is noisier than any other.
- **No autocorrelation**, $$\operatorname{Cov}(\varepsilon_i, \varepsilon_j \mid X) = 0$$ for $$i \neq j$$: every **off-diagonal** entry is zero. Knowing the surprise in row $$i$$ tells you nothing about the surprise in row $$j$$.

**The intuition.** Why does plain OLS minimize an *unweighted* sum of squares $$\sum_{i=1}^n \varepsilon_i^2$$, treating row 1 and row 500 as equally trustworthy? Because it assumes every row carries the same amount of fresh, independent information. That's exactly what $$\Omega = \sigma^2 I_n$$ says.

**What it protects.** In general, the true variance of $$\hat{\beta}$$ is the **sandwich**:

$$\operatorname{Var}(\hat{\beta} \mid X) = \underbrace{(X^T X)^{-1}}_{\text{bread}} \; \underbrace{X^T \Omega X}_{\text{meat}} \; \underbrace{(X^T X)^{-1}}_{\text{bread}}$$

Only when $$\Omega = \sigma^2 I_n$$ does the meat become $$\sigma^2 X^TX$$, cancel one slice of bread, and collapse into the textbook formula:

$$\operatorname{Var}(\hat{\beta} \mid X) = \sigma^2 (X^T X)^{-1}$$

That formula is what every default regression printout uses to compute standard errors and t-stats. And this is the condition, together with Stages 1–3, under which the **Gauss–Markov theorem** says OLS is **BLUE**: the Best Linear Unbiased Estimator. Break spherical errors and two things go wrong: the printed t-stats are computed from the wrong formula, and OLS stops being the best linear estimator.

### Stage 5: Knowing the shape (Normality)

Finally, the last symbol on the far right of the master equation:

$$\hat{\beta} = \beta + (X^T X)^{-1} X^T \boldsymbol{\varepsilon}$$

The raw noise vector itself. The assumption is

$$\varepsilon \mid X \sim \mathcal{N}(0, \sigma^2 I_n).$$

Notice we didn't need normality for unbiasedness (Stage 3) or for Gauss–Markov (Stage 4). So why is it on the list? After Stages 1–4, we know the *mean* of $$\hat{\beta}$$ and its *variance*. We still don't know the *shape* of its distribution. Is it lopsided? Fat-tailed? Normality answers that, for two deeper reasons.

**1. Exact finite-sample inference.** $$\hat{\beta}$$ is just a fixed matrix times $$\varepsilon$$, a linear combination of the errors. If $$\varepsilon$$ is Gaussian, $$\hat{\beta}$$ is exactly Gaussian, even with 20 data points, and your t-stats and F-stats are exact. (In large samples with finite variance, the Central Limit Theorem usually rescues you anyway.)

**2. The loss function itself.** Why did Legendre and Gauss minimize *squared* errors $$\sum \varepsilon_i^2$$, rather than absolute errors $$\sum \lvert \varepsilon_i \rvert$$ or fourth powers $$\sum \varepsilon_i^4$$? Because the Gaussian density contains $$\exp\!\left(-\frac{\varepsilon_i^2}{2\sigma^2}\right)$$. Maximizing a Gaussian log-likelihood is mathematically identical to minimizing $$\sum \varepsilon_i^2$$. Least squares *is* maximum likelihood under normal errors.

**What it protects.** The optimality of the $$L_2$$ loss. Squaring residuals is statistically optimal only when the error distribution has thin, Gaussian tails. When the tails are fat, a handful of extreme observations take over the fit. More on that below.

### The 15-second checklist

You never have to memorize the list again. Read the equation left to right:

| Step | Operation on $$\hat{\beta} = \beta + (X^TX)^{-1}X^T\varepsilon$$ | Assumption it needs | What you lose without it |
|---|---|---|---|
| 1 | Substitute $$y = X\beta + \varepsilon$$ | Linearity | The equation itself is wrong; missing structure hides in $$\varepsilon$$ |
| 2 | Invert $$(X^TX)^{-1}$$ | No multicollinearity | Identifiability; weights explode by $$\frac{1}{1-\rho^2}$$ |
| 3 | Average $$X^T\varepsilon$$ | Strict exogeneity, $$E[\varepsilon \mid X] = 0$$ | Unbiasedness; the slope points the wrong way |
| 4 | Square $$\varepsilon\varepsilon^T$$ for variance | Homoskedasticity (diagonal) + no autocorrelation (off-diagonal) | Valid standard errors and efficiency |
| 5 | Shape $$\varepsilon$$ | Normality | Exact inference; optimality of squared loss |

---

## The autopsy: how markets break every single assumption

In quantitative finance, all of these assumptions are violated, usually at the same time. Here's what each violation looks like on a desk, what it does to $$\hat{\beta}$$, and how practitioners re-engineer the estimator.

| Assumption broken | Where it shows up in quant work | What breaks in $$\hat{\beta}$$ | The fix |
|---|---|---|---|
| Near-multicollinearity, $$\lambda_{\min}(X^TX) \to 0$$ | Overlapping signals (5d, 10d, 20d momentum), correlated macro factors | Still unbiased, but variance explodes; weights blow up with opposite signs | Ridge ($$L_2$$) shrinkage, PCA factor reduction, Gram–Schmidt orthogonalization |
| Exogeneity, $$E[\varepsilon \mid X] \neq 0$$ | Omitted risk factors (market or sector beta), noisy features, price impact | Biased and inconsistent; more data won't fix it | Frisch–Waugh–Lovell residualization, instrumental variables (2SLS), Kalman filters |
| Non-spherical errors, $$\Omega \neq \sigma^2 I_n$$ | GARCH volatility clustering, small-cap vs. large-cap noise, overlapping return horizons | Unbiased but inefficient; naive standard errors far too small (fake t-stats) | Newey–West (HAC) or clustered SEs for inference; WLS / GLS for estimation |
| Heavy tails, kurtosis $$\gg 3$$ | Flash crashes, earnings jumps, bad ticks | Linear estimators lose efficiency; one extreme point hijacks the slope | Huber loss (IRLS), Tukey bisquare, quantile ($$L_1$$) regression |
| Non-stationarity, time-varying $$\beta_t$$ | Regime shifts, alpha decay, structural breaks | A static $$\hat{\beta}$$ averages over dead regimes and fails out of sample | Exponentially weighted least squares, dynamic linear models (Kalman state) |

The last row isn't one of the five classical assumptions; it's the assumption *underneath* all of them, that there is one fixed $$\beta$$ to estimate. I'll leave it for a future post. The other four get a deep dive each.

### Deep dive 1: Near-multicollinearity and the eigenvalue explosion

In practice you rarely put two *identical* columns into $$X$$. Instead you put thirty correlated alpha signals into one regression: 5-day reversal, 10-day reversal, volume-weighted reversal.

**The autopsy.** Take the eigendecomposition of the symmetric matrix $$X^TX = V\Lambda V^T$$, where $$\Lambda = \operatorname{diag}(\lambda_1, \dots, \lambda_k)$$ holds the eigenvalues and $$V$$ the orthogonal eigenvectors. Then $$(X^TX)^{-1} = V\Lambda^{-1}V^T$$, and the total variance of your estimated weights is

$$\sum_{j=1}^k \operatorname{Var}(\hat{\beta}_j \mid X) = \sigma^2 \operatorname{Tr}\left((X^T X)^{-1}\right) = \sigma^2 \sum_{j=1}^k \frac{1}{\lambda_j}.$$

Every eigenvalue contributes its *reciprocal*. For two standardized features with correlation $$\rho$$, the eigenvalues of the correlation matrix are $$1+\rho$$ and $$1-\rho$$. At $$\rho = 0.98$$, $$\lambda_{\min} = 0.02$$ and $$1/\lambda_{\min} = 50$$. At $$\rho = 0.9999$$, $$\lambda_{\min} = 0.0001$$ and $$1/\lambda_{\min} = 10{,}000$$. The matrix is still technically invertible, so your code throws no warning.

The estimator remains unbiased and the in-sample fit $$\hat{y}$$ looks great. But the individual weights become wildly unstable. OLS assigns $$+500$$ to Signal A and $$-499$$ to Signal B to fit tiny in-sample noise. The moment the out-of-sample correlation between A and B drops from $$0.98$$ to $$0.85$$, that $$+500 / -499$$ spread blows up your portfolio.

**The fix.** Trade a little bias for a large reduction in variance with **Ridge regression**:

$$\min_{\beta} \; \Vert y - X\beta \Vert_2^2 + \gamma \Vert \beta \Vert_2^2 \quad\Longrightarrow\quad \hat{\beta}_{\text{Ridge}} = (X^T X + \gamma I)^{-1} X^T y$$

Adding $$\gamma I$$ shifts every eigenvalue from $$\lambda_j$$ to $$\lambda_j + \gamma$$. The total variance becomes

$$\sigma^2 \sum_{j=1}^k \frac{\lambda_j}{(\lambda_j + \gamma)^2},$$

which stays bounded no matter how close $$\lambda_j$$ gets to zero. You've put a floor of $$\gamma$$ under the near-zero eigenvalues so they can never explode on inversion.

### Deep dive 2: Breaking exogeneity, the silent killer

Violating exogeneity is the most dangerous failure in quantitative research because **more data does not help**. As $$N \to \infty$$, $$\hat{\beta}$$ converges confidently to the wrong number. It sneaks in three ways.

**1. Omitted risk factors (hidden beta).** Suppose returns are truly generated by

$$y = X_1 \beta_1 + X_2 \beta_2 + u,$$

where $$X_1$$ is your proprietary alpha signal and $$X_2$$ is market or sector beta, and you regress $$y$$ on $$X_1$$ alone. Plug the true $$y$$ into your regression:

$$E[\hat{\beta}_1] = \beta_1 + \underbrace{(X_1^T X_1)^{-1} X_1^T X_2 \, \beta_2}_{\text{omitted variable bias}}$$

Unless your signal is exactly orthogonal to the factor you left out ($$X_1^TX_2 = 0$$), your signal's weight absorbs the factor's return. You think you found alpha. Your PM sees that you went long high-beta tech.

**2. Errors-in-variables (attenuation bias).** Suppose your feature isn't a clean observable but a noisy estimate, $$\tilde{X} = X + \eta$$: a rolling beta, a sentiment score. The regression error becomes $$\varepsilon - \beta\eta$$, which is correlated with $$\tilde{X}$$ because both contain $$\eta$$. Asymptotically,

$$\hat{\beta}_{\text{OLS}} \xrightarrow{p} \beta \left(\frac{\sigma_X^2}{\sigma_X^2 + \sigma_\eta^2}\right).$$

Your slope is systematically shrunk toward zero by the feature's signal-to-noise ratio.

**3. Simultaneity (endogenous market impact).** You regress 1-minute price changes $$\Delta P_t$$ on net order flow $$Q_t$$ to estimate Kyle's lambda. The estimate is biased, because traders also submit order flow *in response to* contemporaneous price moves. Causality runs both ways, so $$Q_t$$ is entangled with the price shock.

**The fixes.**

- **For omitted factors, Frisch–Waugh–Lovell orthogonalization.** Before testing any alpha signal $$X_1$$, strip out its exposure to the known risk factors $$X_2$$: regress $$X_1$$ on $$X_2$$ and keep the residual,

  $$\tilde{X}_1 = \left(I - X_2(X_2^T X_2)^{-1} X_2^T\right) X_1.$$

  Now $$\tilde{X}_1^T X_2 = 0$$ by construction.
- **For noisy features, model the measurement.** Instead of plugging noisy rolling estimates into OLS, model the true latent feature with a state-space model and a Kalman filter, or use total least squares (orthogonal regression), which minimizes perpendicular rather than vertical distance to the hyperplane.
- **For simultaneity, instrumental variables.** Find a variable that moves $$X$$ but has no direct path to $$\varepsilon$$, and use two-stage least squares.

### Deep dive 3: Non-spherical errors, fake t-stats, and inefficiency

Financial data violate $$\Omega = \sigma^2 I_n$$ every day, in both directions of the grid.

**Off-diagonals: the overlapping-horizon trap.** Suppose you have daily data and regress 10-day forward returns $$r_{t \to t+10}$$ on today's signal $$X_t$$. Today's 10-day return and tomorrow's share 9 of their 10 days. Even if daily returns are pure white noise, the 10-day residuals follow a moving average process, an MA(9), with strong positive autocorrelation.

**Diagonals: heteroskedasticity.** In a cross-sectional regression across 3,000 stocks, a distressed small-cap biotech has ten times the idiosyncratic variance of Johnson & Johnson. In time series, a VIX-at-45 month is far noisier than a VIX-at-12 month.

**The autopsy.** Two distinct things go wrong.

1. **Your standard errors lie.** With overlapping 10-day returns over 1,000 days, you have roughly $$1{,}000 / 10 = 100$$ independent observations, not 1,000. When the signal itself is slow-moving, as most real signals are (momentum, value, carry), naive OLS treats all 1,000 rows as independent and shrinks your standard error by roughly $$\sqrt{10} \approx 3.16$$. A useless slow-moving signal with a true t-stat of 0.9 prints a t-stat around 2.85 in a default regression summary. You'll see exactly this in the lab below.
2. **Your slope is inefficient.** Because OLS minimizes an *unweighted* $$\sum \varepsilon_i^2$$, a volatile micro-cap with a 15% residual pulls with 225 units of squared error, while a stable mega-cap with a 1% residual pulls with 1. OLS bends the whole hyperplane to appease the noisiest stocks and the most chaotic days.

**The fixes.**

- **Fix the inference with sandwich estimators.** Never trust default OLS standard errors in finance. Keep the full sandwich, $$(X^TX)^{-1}(X^T\hat{\Omega}X)(X^TX)^{-1}$$, with a **White** estimate of $$\hat{\Omega}$$ for heteroskedasticity, **Newey–West (HAC)** for autocorrelation up to some lag $$L$$, or **clustered / Fama–MacBeth** standard errors for cross-sectional correlation.
- **Fix the estimator with GLS.** Don't just patch the t-stats; fix the weights. Multiply the whole regression by $$\Omega^{-1/2}$$:

  $$\Omega^{-1/2} y = (\Omega^{-1/2} X)\beta + \Omega^{-1/2} \varepsilon$$

  The transformed error $$\tilde{\varepsilon} = \Omega^{-1/2}\varepsilon$$ has covariance $$\Omega^{-1/2}\,\Omega\,\Omega^{-1/2} = I_n$$. It's spherical again. Running OLS on the transformed variables gives **Generalized Least Squares**:

  $$\hat{\beta}_{\text{GLS}} = (X^T \Omega^{-1} X)^{-1} X^T \Omega^{-1} y$$

  In equity factor models like Barra, the special case is **Weighted Least Squares**, with $$\Omega^{-1} = \operatorname{diag}(1/\hat{\sigma}_1^2, \dots, 1/\hat{\sigma}_n^2)$$: each stock is down-weighted by its estimated idiosyncratic variance, so noisy names don't corrupt the factor return estimates.

### Deep dive 4: Heavy tails, and why $$L_2$$ loss fails

Textbooks often wave away non-normality: "By Gauss–Markov, OLS is still BLUE without normality, and by the CLT, t-stats work for large $$N$$." The trap is hidden in the acronym. BLUE means *Best* ***Linear*** *Unbiased Estimator*. It's the best among linear estimators. When the tails are fat, every linear estimator is bad, and a nonlinear one can beat all of them.

**The autopsy.** Take the OLS loss and its gradient:

$$\mathcal{L}(\beta) = \frac{1}{2} \sum_{i=1}^n (y_i - x_i^T \beta)^2, \qquad \nabla_\beta \mathcal{L}(\beta) = -\sum_{i=1}^n \underbrace{(y_i - x_i^T \beta)}_{\psi(\varepsilon_i) \,=\, \varepsilon_i} x_i = 0$$

In robust statistics, $$\psi(\varepsilon_i)$$ is the **influence function**: how hard a single observation pulls on $$\hat{\beta}$$. For OLS, $$\psi(\varepsilon_i) = \varepsilon_i$$ is unbounded. A single $$10\sigma$$ flash crash or bad tick pulls ten times harder than a normal $$1\sigma$$ day (and contributes a hundred times the squared loss). To quiet that one residual, OLS tilts the entire line away from the 99.9% of normal data. With Student-$$t$$ errors at around 3 degrees of freedom, a rough match for daily equity returns, this happens constantly.

**The fix.** Swap the $$L_2$$ loss for the **Huber loss**, solved by iteratively reweighted least squares (IRLS):

$$\rho_\delta(\varepsilon) = \begin{cases} \frac{1}{2}\varepsilon^2 & \text{if } \lvert \varepsilon \rvert \le \delta \\[4pt] \delta\left(\lvert \varepsilon \rvert - \frac{1}{2}\delta\right) & \text{if } \lvert \varepsilon \rvert > \delta \end{cases}$$

Look at its influence function, $$\psi_\delta(\varepsilon) = \rho_\delta'(\varepsilon)$$. Inside the normal regime ($$\lvert\varepsilon\rvert \le \delta$$) it equals $$\varepsilon$$, exactly like OLS, so you keep OLS's efficiency on clean data. Outside the threshold it caps at a constant $$\pm\delta$$, behaving like $$L_1$$ (median) regression. A $$20\sigma$$ earnings shock pulls on your slope no harder than a $$\delta$$-sized move.

---

## Interactive lab: break OLS yourself

Reading about fake t-stats is one thing. Watching them appear is another. The simulator below generates data from a known model, where you control the truth, and fits three estimators to it:

- **OLS**, the default.
- **WLS**, which weights each row by its inverse noise variance (the fix for heteroskedasticity).
- **Huber**, the robust fix for fat tails and bad ticks.

It also reports three t-stats for the OLS slope: the **naive** textbook one, **White** (heteroskedasticity-robust), and **Newey–West** (robust to autocorrelation too).

Start with a preset, then push the sliders. The most important button is **Run 400 backtests**: it simulates 400 datasets where the signal is *completely useless* ($$\beta = 0$$) and counts how often each t-stat declares it "significant" at the 5% level. If your inference is honest, that number should be about 5%.

<div id="ols-lab-mount"></div>
<script src="/assets/js/ols-lab.js" defer></script>

A few things to try:

- **Overlapping 10-day returns.** Run the backtests. The naive t-stat calls a useless signal significant around 45% of the time. White barely helps, because White only fixes the diagonal of $$\Omega$$, not the off-diagonals. Newey–West brings it down a lot, but notice it doesn't get all the way to 5% with 250 rows: you only have about 25 independent observations, and no standard-error formula can conjure information that isn't there.
- **Bad tick.** One corrupted print at the most extreme signal value. Watch the OLS line pivot while Huber barely moves. That's the unbounded influence function, live. Run the backtests: that single point drags OLS far enough that the naive t-stat finds a "signal" in a useless one more than half the time, and OLS's typical error is roughly three times Huber's.
- **Fat tails.** No single disaster, just a Student-$$t$$ with 3 degrees of freedom. Every individual fit looks fine. The backtests show the cost: Huber's typical error is about 30% smaller than OLS's. That's BLUE's "linear" fine print.
- **Heteroskedastic.** The noise fans out as the signal grows. The naive t-stat now over-rejects (around 20% instead of 5%) and White's correction brings it back near 5%. All three slopes stay roughly unbiased, but WLS has the smallest typical error. That's efficiency: same truth, less wasted information.
- **Clean world.** Everything agrees. That's what the textbook formulas assume, and it's the only world where the default printout is telling you the truth.

---

## The takeaway

If someone asks, "What are the assumptions of OLS, and which one matters most?", don't rattle off a list. Write the error equation,

$$\hat{\beta} - \beta = (X^T X)^{-1} X^T \varepsilon,$$

and rank the assumptions by how much damage their failure does:

1. **Exogeneity, $$E[\varepsilon \mid X] = 0$$, matters most**, because its failure biases $$\hat{\beta}$$ even with infinite data, and you can't see it in the residuals.
2. **Heavy tails and outliers come next** in low signal-to-noise data like returns, because the unbounded $$L_2$$ gradient lets a few corrupted ticks dictate your weights.
3. **Non-spherical errors come third**, because autocorrelation and volatility clustering manufacture fake t-stats that trick researchers into deploying noise.

Collinearity and normality matter too, but their damage is visible and fixable: unstable weights you can shrink, and inference you can rescue with more data.

The list was never the point. The equation is. Each assumption is just the answer to "what do I need to be true to take the next step?"
