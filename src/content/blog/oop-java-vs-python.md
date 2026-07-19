---
title: "Object Oriented Programming: Java vs Python"
category: Technology
date: Dec 14, 2024
readTime: 4 min read
slug: object-oriented-programming-java-vs-python
cover: empty
---
Before diving deeper into this topic, I want to emphasize the importance of **[Object-Oriented Programming (OOP)](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object-oriented_programming)**. When you understand the key concepts and apply them to your daily work, the benefits will come naturally. Learning OOP helps you:

* **Organize** code logically.
* **Reuse** existing solutions.
* **Maintain** and **scale** projects effectively.
* **Model real-world problems** intuitively.



Mastering these key concepts will pave the way for exploring more advanced topics like:

* Design Patterns
* SOLID Principles
* Metaprogramming
* Reflection and Introspection
* Dependency Injection
* Mixins
* Multiple Inheritance
* Object-Oriented Analysis and Design (OOAD)
* Composition over Inheritance
* Aspect-Oriented Programming (AOP)

Don’t you want to explore these exciting topics now? Take your time and trust the process. Let’s get started!

The topic will cover some key concepts from OOP in Python and Java because I want to make a comparison between these 2 languages.

Java is a statically-typed, compiled language that I learned during my undergraduate degree, while Python is a dynamically-typed language that I’ve used extensively in my recent career.

*Remember: learning the syntax is a minor thing. Focus on understanding these core concepts first, and you'll be able to apply them to any OOP language.*

### Encapsulation

**Definition:** Bundling data and methods (attributes and functions) that operate on a single unit (class/object) while restricting access to some of the object’s components.

**Goal:** Protect the internal state of objects and ensure data integrity.

### **Example in Java**

```
public class Person {
    private String name; // Private field

    // Getter method
    public String getName() {
        return name;
    }

    // Setter method
    public void setName(String name) {
        this.name = name;
    }
}
```

### **What would be different in Python:**

```
class Person:
    def __init__(self, name):
        self.__name = name  # Private attribute

    def get_name(self):
        return self.__name

    def set_name(self, name):
        self.__name = name

person = Person("Alice")
print(person.get_name())  # Output: Alice
```



### Inheritance

**Definition:** Allowing objects to “inherit” attributes and functions from a parent object, which all share attributes and functions. Represents an "is-a" relationship between objects.

**Goal:** Promotes reusability of objects and establishes hierarchy between classes.

### **Example in Java**

```
class Animal {
    void eat() {
        System.out.println("This animal eats food.");
    }
}

class Dog extends Animal {
    void bark() {
        System.out.println("The dog barks.");
    }
}
```

### **What would be different in Python:**

```
class Animal:
    def eat(self):
        print("This animal eats food.")

class Dog(Animal):  # Dog inherits from Animal
    def bark(self):
        print("The dog barks.")

my_dog = Dog()
my_dog.eat()  # Output: This animal eats food.
my_dog.bark()  # Output: The dog barks.
```



### Polymorphism

**Definition:** The ability of a method to behave differently based on the objects calling it. It is tightly coupled with inheritance and abstract classes. Subclasses require concrete implementation or some form of method overriding or method overloading.

**Goal:** Enable flexibility and dynamic behavior.

### **Example in Java**

**Method Overriding:**

```
class Animal {
    void sound() {
        System.out.println("Some sound...");
    }
}

class Dog extends Animal {
    @Override
    void sound() {
        System.out.println("Woof!");
    }
}
```

**Method Overloading:**

```
class Calculator {
    int add(int a, int b) {
        return a + b;
    }

    double add(double a, double b) {
        return a + b;
    }
}

What would be dif
```

### **What would be different in Python:**

**Method Overriding:**

```
class Animal:
    def sound(self):
        print("Some sound...")

class Dog(Animal):
    def sound(self):
        print("Woof!")

class Cat(Animal):
    def sound(self):
        print("Meow!")

animals = [Dog(), Cat()]
for animal in animals:
    animal.sound()
# Output:
# Woof!
# Meow!
```

**Method Overloading (Using Default Args):**

```
class Calculator:
    def add(self, a, b=0):
        return a + b

calc = Calculator()
print(calc.add(5))        # Output: 5
print(calc.add(5, 10))    # Output: 15
```



### Composition



**Definition:** Objects can be built-in or composed from other objects, representing a "has-a" relationship.

**Goal:** Simplify code and reduce complexity.

### **Example in Java**

```
class Engine {
    void start() {
        System.out.println("Engine starting...");
    }
}

class Car {
    private Engine engine; // Car has an Engine

    // Constructor to inject the Engine dependency
    public Car(Engine engine) {
        this.engine = engine;
    }

    void start() {
        System.out.println("Car is starting...");
        engine.start(); // Delegate to the Engine class
    }

    public static void main(String[] args) {
        Engine engine = new Engine();
        Car car = new Car(engine);
        car.start();
    }
}
```

### **What would be different in Python:**

```
class Engine:
    def start(self):
        print("Engine starting...")

class Car:
    def __init__(self, engine):
        self.engine = engine  # Car has an Engine

    def start(self):
        print("Car is starting...")
        self.engine.start()  # Delegate to the Engine class

engine = Engine()
car = Car(engine)
car.start()
```



## Terminology

* Objects: a single unit that can be used as building blocks for OOP.
* Attributes: data stored in objects that represent the state of objects. For example, eyes, mouth, ears are attributes of a people object.
* Methods/Functions: behaviors of what the objects can do. For example: people object can walk, run, etc.
* Class: Blueprint of an object.
* Interface: Means of commiunication for classes; should specify how users of the class use the class.
