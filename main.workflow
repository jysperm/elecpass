workflow "New workflow" {
  on = "push"
  resolves = ["yarn-dist"]
}

action "yarn-install" {
  uses = "borales/actions-yarn@master"
  args = "install"
}

action "yarn-build" {
  uses = "borales/actions-yarn@master"
  args = "build"
  needs = ["yarn-install"]
}

action "yarn-dist" {
  uses = "borales/actions-yarn@master"
  args = "dist"
  needs = ["yarn-build"]
}
