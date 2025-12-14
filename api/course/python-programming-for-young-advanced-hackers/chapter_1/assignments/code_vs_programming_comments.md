# Mission: Code vs Programming – Comment Detective

## Goal

Learn the difference between **programming** (planning and thinking) and **code** (exact Python instructions).

You will read a small "storyboard" program and decide which lines are planning and which lines are code.

## What you'll use

- File: `attachments/code_vs_programming_comments.py`
- Language: Python

## Programming vs Code

- **Programming** is when you plan what the program should do: write steps, ideas, and future features in plain language.
- **Code** is when you write real Python instructions that the computer can run.

In this exercise, you will mark each line so we know which is which.

## Steps

1. Open `attachments/code_vs_programming_comments.py`.
2. Read the comments that describe the steps and plans, such as lines that start with:
   - `Step 1: Decide what the program should do.`
   - `Step 2: We want to greet the user with their name.`
   - `Plan: If the user does not type anything, we will still say hello.`
   - `Step 3: Later we could add more features, like asking for their age.`
3. At the **end** of each planning/thinking comment line, add the marker `# PROGRAMMING`.
4. Find the real Python code lines, such as:
   - `name = input("What is your name? ")`
   - `print("Hello, " + name + "!")`
5. At the **end** of each real code line, add the marker `# CODE` as an inline comment.
6. Save the file.
7. (Optional) Run the file to make sure it still works and that your extra comments did not break anything.

## You're done when

- [ ] Every planning/thinking comment about steps or plans ends with `# PROGRAMMING`.
- [ ] Every real Python instruction line ends with `# CODE`.
- [ ] You did **not** delete the original comments or code; you only added markers at the end of lines.
- [ ] The Python file still runs without syntax errors.

## Optional bonus (brain stretch)

Write **one extra comment** at the bottom of the file with another idea for this program, for example:

- `# Step 4: Save the user's name so we can greet them again next time. # PROGRAMMING`

This helps you think like a programmer planning future features.
