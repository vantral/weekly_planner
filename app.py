from flask import Flask, render_template, request, redirect, url_for, jsonify, make_response, g
import json
import os
from datetime import datetime, timedelta

app = Flask(__name__)

# Directory paths for storing data
TASKS_DIR = 'data/tasks'
NOTES_DIR = 'data/notes'

# Ensure directories exist
os.makedirs(TASKS_DIR, exist_ok=True)
os.makedirs(NOTES_DIR, exist_ok=True)

# Helper functions
def load_tasks_for_week(start_date):
    """Load tasks for a given week from JSON files."""
    tasks = {}
    for i in range(7):
        day = start_date + timedelta(days=i)
        day_str = day.strftime('%Y-%m-%d')
        file_path = os.path.join(TASKS_DIR, f"{day_str}.json")
        
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                tasks[day_str] = json.load(f)
        else:
            tasks[day_str] = []
    return tasks

def save_task(date, task):
    """Save a task to a JSON file by date."""
    file_path = os.path.join(TASKS_DIR, f"{date}.json")
    tasks = []
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            tasks = json.load(f)
    tasks.append(task)
    with open(file_path, 'w') as f:
        json.dump(tasks, f)

def load_notes(week_str):
    """Load notes from a Markdown file."""
    notes_path = os.path.join(NOTES_DIR, f"{week_str}.md")
    if os.path.exists(notes_path):
        with open(notes_path, 'r') as f:
            return f.read()
    return ""

def save_notes(week_str, content):
    """Save notes to a Markdown file."""
    notes_path = os.path.join(NOTES_DIR, f"{week_str}.md")
    with open(notes_path, 'w') as f:
        f.write(content)


@app.route('/')
def home():
    """Weekly planner view."""
    # Get the current week starting from today (Monday)
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())
    print(start_of_week)
    tasks = load_tasks_for_week(start_of_week)

    # Create a dictionary where each day maps to its tasks
    week_days = [(start_of_week + timedelta(days=i)) for i in range(7)]
    week_days_str = [day.strftime('%Y-%m-%d') for day in week_days]  # Date strings

    # Pass tasks organized by day and the week's notes to the template
    week_str = start_of_week.strftime('%Y-%W')
    general_notes = load_notes(week_str)

    return render_template(
        'planner.html',
        week_days=week_days,
        tasks=tasks,
        general_notes=general_notes
    )


@app.route('/add_task', methods=['GET', 'POST'])
def add_task():
    """Add task or meeting."""
    if request.method == 'POST':
        task_type = request.form['type']
        title = request.form['title']
        date = request.form['date']
        time = request.form['time']
        details = request.form['details']

        task = {
            "type": task_type,
            "title": title,
            "time": time,
            "details": details
        }
        
        save_task(date, task)
        return redirect(url_for('home'))

    return render_template('add_item.html')

@app.route('/save_notes', methods=['POST'])
def save_general_notes():
    """Save general weekly notes."""
    week_str = request.json['week']
    content = request.json['content']
    save_notes(week_str, content)
    return jsonify({"status": "Notes saved successfully"})

@app.route('/get_week', methods=['POST'])
def get_week():
    """Get tasks for a specified week."""
    data = request.get_json()
    week_start_date = datetime.strptime(data['week_start'], '%B %d, %Y')
    tasks = load_tasks_for_week(week_start_date)
    print(tasks)
    # Return tasks in JSON format where keys are 'YYYY-MM-DD' strings
    return jsonify(tasks)

if __name__ == '__main__':
    app.run(debug=True)
