# Mission: Debug the Broken Greeting

## Goal

Repair a broken Python program so that it prints:

Hello, World!

when you run it.

You're the bug detective on this one.

## What you'll use

- File: `attachments/fix_the_greeting.py`
- Language: Python

## Your mission

A curious hacker tried to write a greeting program, but the code is broken.
Your job is to **fix** it so it runs without errors and prints the greeting exactly once.

## Steps

1. Open the file `attachments/fix_the_greeting.py`.
2. Read the comments at the top of the file. They explain what the program is supposed to do.
3. Find the **broken version** of the greeting. It will look almost right, but something about the quotes or parentheses is wrong.
4. Keep the broken version **commented out** so it stays as an example of what *not* to do.
5. Under the comments that say something like "Fixed version", write a correct line of code that prints:
   - `Hello, World!`
6. Make sure your fixed line is **not** commented out.
7. Save the file and run it.
8. Check the output: it should show exactly `Hello, World!` on one line.

## You're done when

- [ ] The old broken line is still in the file, but it is commented out.
- [ ] You added one **correct** `print("Hello, World!")` line that is not commented out.
- [ ] When you run the script, the output is exactly `Hello, World!` followed by a newline.
- [ ] There are no extra greetings or error messages.

## Optional bonus (side quest)

After the basic version works, try this:

- Change the code so it asks for the user's name with `input(...)` and then prints `Hello, <name>!`.

(Keep a copy of the simple `Hello, World!` version somewhere so you can still pass the automatic tests.)
