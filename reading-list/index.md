---
layout: default
title: Reading List
---

<div class="reading-list-page">

<a href="/" class="back-link">&#8249; Back</a>

<h1>Reading List</h1>

<h2>Books</h2>

<ul>
  <li><a href="#">The Mathematics of Financial Derivatives</a></li>
  <li><a href="#">An Introduction to the Mathematics of Financial Derivatives</a></li>
</ul>

<h2>Articles</h2>

<ul>
  <li>—</li>
  <li>—</li>
</ul>

<h2>Research Papers</h2>

<ul>
  <li>—</li>
  <li>—</li>
</ul>

</div>

<script>
document.querySelectorAll('.reading-list-page ul').forEach(ul => {
  const allEmpty = Array.from(ul.querySelectorAll('li')).every(li => li.textContent.trim() === '—');
  if (allEmpty) {
    ul.style.display = 'none';
    const prev = ul.previousElementSibling;
    if (prev && prev.tagName === 'H2') prev.style.display = 'none';
  }
});
</script>