---
title: "The Chicken-and-Egg Problem of Classes and Objects in Ruby (with a Twist of Metaprogramming)"
category: Technology
date: "Mar 16, 2025"
readTime: "3 min read"
cover: illustration
---

Ruby's object model has a famous philosophical puzzle at its core: every class is an object, but every object is an instance of a class. So which came first — the class or the object?

## The Puzzle

In Ruby, `Class` is a class. But `Class` is also an object — an instance of itself. And `Object` is a class, but it's also an instance of `Class`. It's turtles all the way down.

```ruby
Class.class   # => Class
Object.class  # => Class
Class.superclass # => Module
Module.superclass # => Object
Object.superclass # => BasicObject
BasicObject.superclass # => nil
```

## The Bootstrap

Ruby's C runtime bootstraps this circular dependency by creating `BasicObject`, `Object`, `Module`, and `Class` simultaneously before any Ruby code runs. The interpreter "cheats" — it sets up the object graph manually in C, then hands control over to Ruby.

## The Metaprogramming Twist

Because classes are objects, you can manipulate them at runtime just like any other object:

```ruby
Dog = Class.new do
  def bark
    "Woof!"
  end
end

Dog.new.bark # => "Woof!"
```

This makes Ruby's metaprogramming unusually powerful. You can define classes, add methods, and reshape the object hierarchy all at runtime.
