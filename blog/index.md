---
layout: default
title: Blog Posts
---

<div class="reading-list-page">

<a href="/" class="back-link"><span class="back-chevron">&#8249;</span> Back</a>

<h1>Blog Posts</h1>

<ul class="post-list">
  {% for post in site.posts %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <span class="post-list-meta"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %-d, %Y" }}</time></span>
  </li>
  {% endfor %}
</ul>

</div>
