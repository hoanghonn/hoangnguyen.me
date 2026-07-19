---
title: "Object Oriented Programming: Java vs Python"
category: Technology
date: "Dec 14, 2024"
readTime: "4 min read"
slug: object-oriented-programming-java-vs-python
cover: empty
---

Both Java and Python are object-oriented, but they take meaningfully different approaches. Understanding the differences helps you write more idiomatic code in both languages.

## Static vs Dynamic Typing

Java enforces types at compile time. Python resolves types at runtime. This changes everything about how you design classes — in Java, interfaces and abstract classes are structural contracts enforced by the compiler; in Python, duck typing means you rely on convention and documentation instead.

## Access Control

Java has `public`, `protected`, `private`, and package-private modifiers. Python has a convention: prefix with `_` for "internal", `__` for name-mangled "private". Nothing is truly private in Python.

## Inheritance

Java supports single inheritance with interface-based multiple inheritance. Python supports true multiple inheritance with C3 linearization (MRO) to resolve conflicts.

```python
class A:
    def method(self): return "A"

class B(A):
    def method(self): return "B"

class C(A):
    def method(self): return "C"

class D(B, C):
    pass

D().method()  # => "B" — follows MRO
```

## When to Use Which

Java's verbosity pays off in large teams and long-lived codebases. Python's expressiveness wins for prototyping, data work, and smaller teams. Neither is universally better.
