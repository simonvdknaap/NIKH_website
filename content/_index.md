---
description: Een voorbeeldwebsite voor NIKH (Herman Hopman)
lastmod: 2025-12-20
title: NIKH Gallerie
resources:
  - src: home-cover.jpg
    params:
      cover: true # cover of the home page is used for OpenGraph cards, etc.
menus:
  main:
    name: Home
    weight: -1
# sub-galleries on list pages are sorted by date and weight (descending)
cascade:
  build:
    publishResources: false # do not include full images. Also disable download
---
