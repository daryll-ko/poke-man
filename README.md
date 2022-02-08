# Pac-man?

I've always wondered when I would finish my first project. I guess the whole concept of a project has just been pretty nebulous to me, as someone who's never really gotten their hands into one.

What was the bottleneck, I wonder? I definitely wouldn't say "motivation": I can spend all day playing around in Kattis without any desire of stopping whatsoever. Inspiration, perhaps?

Ah well, what matters is where I'm at now. I have the main part of this project down, and I'll be focusing on design next. I've also thought of some project ideas that feel really cool to me, and I'm eager to start working on those. I finally feel like I'm on the side where the grass is greener.

...But I digress. What have I made?

## Elevator Pitch

![demo-gif](https://media.giphy.com/media/3VGEAKcFTATCci0H5x/giphy.gif)

Pac-man? is loosely based on [Pac-man](https://en.wikipedia.org/wiki/Pac-Man) (who would've thought?). You play as an orange circle and move around the board collecting black squares. These black squares come in different sizes, and larger squares merit more points. Your goal is to reach a certain amount of points without getting "eaten" (read: touched) by any of the ghosts, which are denoted by purple circles.

## Technicalities

I just used the standard trio (HTML + CSS + JS). I held off on using fancier things like TypeScript and React for now because I wanted to get comfortable with the primitives first.

For the more interesting bits, read the next section.

## Stories

- It took me a bit of time to realize that the `index.js` file should be at the last part inside the `<body>` tags. Oops.

- The maze was generated using randomized depth-first-search. I have plans on including other maze generation algorithms from [this](https://en.wikipedia.org/wiki/Maze_generation_algorithm) cool Wikipedia article in future iterations. I wanted the borders to be accessible, so I generated the inner part of the maze first then just naively plopped a bunch of bridges between this inner part and the borders.

- Each ghost takes on one of two strategies at random:

  - Move randomly.
  - Move in the direction that makes them end up in the cell with the least [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry) to where Pacman is.

  Both are vastly suboptimal, I know. I plan on throwing in [Floyd-Warshall](https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm) in the future (though time complexity concerns me a bit) to make the ghosts competent for once in their ethereal lives.

- I like the progress bar a lot. CSS and JS really can come a long way.

## Plans

Mostly for self-reference.

- Add modals, carousels, and animations
- Make the layout responsive (and fix some current design quirks)
- Modularize code
- Give the ghosts a bit of intelligence
- Add start/reset buttons
- Host the project!

## History

| Release Date | Version |
| :----------: | :-----: |
| 2/8/21 | 1 |
