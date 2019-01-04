# Phreshistant

Simple cross-platform project manager and todo app for single persons (freelancers for example).
Organize your ideas, projects, tasks, notes.

- Nice, clean, oreview design.
- Privacy focus.
- From the idea to lunch. (project states)
- Track your work time each todos and all of project.
- Get to-dos out of your head and more focus to the present. Free your mind!


### Private sphere

**Your data is yours.**
Phreshistant not communicate any clouds. All your data is keep on your machine.
Don't need internet connection or extrernal accounts.


## Features

##### Choose your workspace folder.

##### Import/Export database files.

##### Choose theme (at moment: light, dark, coffee).

##### Resize views (project and todo columbs).

##### Project states (order by this sequence)
- Processing (running)
- Testing (in review)
- Freeze (temporary parked. Ex.: don't want work on it for a while, but in the future maybe wants again)
- Idea (all new project start in this state)
- Notes (It isn't a really state, you can use this for categories other notes. Even separate life things. For example project name is recipes, todo is the recipe title and the todo note is the recipe description)
- Stopped (killed project, but you don't want delete )
- Finished (you can re-set states from all to all exept Idea)

*Project delete is remove all todos and todo notes also!*

##### Todo states (order by this sequence, secondary order is the priority)
- Processing (running)
- Testing (in review)
- Idle (stopped)
- Finished (you can re-set states from all to all)

##### Todos
- Home (todos without any project)
- Colorize texts on mouse over (for the easy distinction and for fun :D )
- You can create one note (simple text or markdown) each todo with "Edit note". Use for description, spec, sub-tasks, etc
- Set priority (Low, Medium, High)
- Search in todos for quick find it (texts and todo notes in all projects)
- Time tracking per todo (auto activate in "Processing" and "Testing" states and show the elapsed time in realtime)
- Auto filter tasks to states (tabs)
- Built-in simple (wooden) markdown editor (bold, italic, headers 1-6, blockquote, link, file, code, lists, checkboxes, separator, table) - autosave in every 10sec.
- Todos notes rendered with "markdown-it".

##### Reminder types
- Once (trigger at time)
- Periodic (trigger every setted time, between 5-600 mins)
- Dialy (trigger every day once at time)
- Weekly (trigger every week once at time)
- Monthly (trigger every month once at time)
- Yearly (trigger every year once at time)

##### Reminder
- Set date and time
- Set a text you want show on trigger
- Choose the type
- Alert window on trigger (optional, default false)
- Modal window on trigger (optional, default true)
- Focus app window on trigger (optional, default true)
- Restore todos to Idle state (flexible scheduling)

**You can pick up todos for all types of reminders. On trigger the choosed todos (re)set to "Idle" state.**

## Upgrade 1.1.2 Features

- Todo note editor toolbar position fixed on scroll also
- Views height resize on maximize and restore also
- Electron version upgrade to 4.0

## Upgrade 1.1.1 Features

- Settings added: Toggle show clock
- Settings added: Reload app
- Themes added: Purple
- Themes added: Hello Kitty (pink)
- Themes added: Ubuntu glass
- Project- Todo list worktime is now divided to hours only (the old style is still divided to days and years, now it shows in popup on the worktime hover)
- Project- Todo list state menu added: 'Workprice'
  (The value of the todo(s) price per hour. Add it to the project for set global price to all todos and/or add to a todo for overwrite/add price just for the task.)
- Markdown links (links in todo notes text) opens in your default browser from now on. (This is only valid for the new links, if you want to use the old links, please recreate them in your todo notes.)


## Screenshots

![App menu (dark theme)](https://github.com/Phreshhh/Phreshistant/blob/master/build/screenshots/menu.jpg)
![Todo states](https://github.com/Phreshhh/Phreshistant/blob/master/build/screenshots/todo-states.jpg)
![Todo sorting](https://github.com/Phreshhh/Phreshistant/blob/master/build/screenshots/todo-sort.jpg)
![Todo note editor](https://github.com/Phreshhh/Phreshistant/blob/master/build/screenshots/todo-note-editor.jpg)
![Todo note markdown rendered](https://github.com/Phreshhh/Phreshistant/blob/master/build/screenshots/project-note-state.jpg)


## Licence
Copyright (c) 2018, Krisztián Kis - Phresh-IT. All rights reserved.

Licensed under the [MIT](https://github.com/Phreshhh/Phreshistant/blob/master/LICENSE.md) License.


## Builds
[Phreshistant v1.1.1.0](https://github.com/Phreshhh/Phreshistant/releases/tag/v1.1.1.0)

[Phreshistant v1.1.1](https://github.com/Phreshhh/Phreshistant/releases/tag/v1.1.1)

[Phreshistant v1.0.0](https://github.com/Phreshhh/Phreshistant/releases/tag/v1.0.0)


## Web

[Phresh-IT](http://phresh-it.hu/)

[Phreshistant](http://phresh-it.hu/apps/phreshistant/)


## Dev

Clone or download the repo and navigate in console to the program's root folder.

### Install

```
npm install
```

### Run

```
npm start
```


### Packaging (win32 is x86, others x64)

```
npm run pack-win32

npm run pack-win

npm run pack-lin

npm run pack-mac
```

*Packaged zips not required installion, just unzip and run the executeable file.*


### Build

```
npm run dist
```
