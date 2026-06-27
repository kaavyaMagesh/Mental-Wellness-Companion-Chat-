from pathlib import Path

BASE_DIR = Path("evaluation-kb")

DATA = {
    "stress": [
        "Common causes of stress include work pressure and deadlines.",
        "Stress may contribute to headaches and fatigue.",
        "Breathing exercises can help manage stress.",
        "Regular exercise may reduce stress levels.",
        "Time management can help reduce stress.",
        "Supportive relationships can buffer stress.",
        "Relaxation techniques may improve wellbeing.",
        "Taking breaks can reduce mental overload.",
        "Sleep habits affect stress management.",
        "Journaling may help process stressful experiences."
    ],

    "anxiety": [
        "Anxiety may involve excessive worry.",
        "Grounding exercises may help anxiety.",
        "Deep breathing can reduce anxious feelings.",
        "Physical activity may help anxiety management.",
        "Limiting information overload may reduce anxiety.",
        "Breaking tasks into smaller steps may help.",
        "Talking with trusted people can provide support.",
        "Mindfulness practices may reduce anxiety.",
        "Healthy routines support anxiety management.",
        "Recognizing anxiety triggers can be useful."
    ],

    "sleep": [
        "Consistent sleep schedules improve sleep quality.",
        "Reducing caffeine may support better sleep.",
        "Limiting screen exposure before bed may help.",
        "A calming bedtime routine can improve sleep.",
        "Sleep environments should be comfortable.",
        "Exercise may improve sleep quality.",
        "Avoiding heavy meals before bed may help.",
        "Natural light exposure supports sleep cycles.",
        "Stress can affect sleep quality.",
        "Good sleep hygiene promotes healthy rest."
    ],

    "mindfulness": [
        "Mindfulness focuses attention on the present moment.",
        "Mindful breathing is a common technique.",
        "Body scan exercises promote awareness.",
        "Mindfulness may reduce emotional reactivity.",
        "Observing thoughts without judgment is important.",
        "Short mindfulness breaks can be helpful.",
        "Mindfulness can improve focus.",
        "Mindfulness supports emotional regulation.",
        "Daily mindfulness practice builds consistency.",
        "Awareness of sensations is part of mindfulness."
    ],

    "cbt": [
        "CBT explores links between thoughts and behaviors.",
        "Identifying unhelpful thoughts is a CBT skill.",
        "Cognitive reframing is used in CBT.",
        "Behavioral activation is a CBT technique.",
        "Thought records are commonly used in CBT.",
        "Goal setting supports CBT interventions.",
        "Problem solving is part of CBT.",
        "Reflection helps develop self-awareness.",
        "Small behavioral changes can create progress.",
        "CBT skills improve with practice."
    ],

    "depression": [
        "Depression may affect mood and motivation.",
        "Social connection may support wellbeing.",
        "Daily routines can be beneficial.",
        "Meaningful activities may help maintain engagement.",
        "Seeking support is important.",
        "Professional guidance may be helpful.",
        "Self-care practices support wellbeing.",
        "Emotional difficulties can affect anyone.",
        "Persistent symptoms should not be ignored.",
        "Awareness promotes early support seeking."
    ]
}

BASE_DIR.mkdir(exist_ok=True)

for topic, docs in DATA.items():

    topic_dir = BASE_DIR / topic
    topic_dir.mkdir(exist_ok=True)

    for idx, content in enumerate(docs, start=1):

        file_path = (
            topic_dir /
            f"{topic}_{idx:03}.md"
        )

        file_path.write_text(
            f"# {topic.title()} {idx}\n\n{content}",
            encoding="utf-8"
        )

print("Evaluation KB generated successfully.")