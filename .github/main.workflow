workflow "New workflow" {
  on = "push"
  resolves = ["yarn-dist"]
}

action "yarn-install" {
  uses = "borales/actions-yarn"
  args = "install"
}

action "yarn-build" {
  uses = "borales/actions-yarn"
  args = "build"
  needs = ["yarn-install"]
}

action "yarn-dist" {
  uses = "borales/actions-yarn"
  args = "dist"
  needs = ["yarn-build"]
}
