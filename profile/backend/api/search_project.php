<?php
include "../../../backend/api/config.php";
$conn = getConnection();

// Fetch domains for filter dropdown
$domains_result = $conn->query("SELECT id, name FROM domains ORDER BY name");

// Fetch all existing skills for reference
$existing_skills = [];
$skills_result = $conn->query("SELECT id, name FROM skills ORDER BY name");
while($row = $skills_result->fetch_assoc()) {
    $existing_skills[$row['id']] = $row['name'];
}

// Initialize filter variables
$domain_filter = isset($_GET['domain_id']) ? (int)$_GET['domain_id'] : 0;
$experience_filter = isset($_GET['experience_level']) ? $_GET['experience_level'] : '';
$selected_skills = isset($_GET['selected_skills']) ? explode(',', $_GET['selected_skills']) : [];
$selected_skills = array_filter(array_map('trim', $selected_skills));
$project_name = isset($_GET['project_name']) ? trim($_GET['project_name']) : '';
$search_mode = isset($_GET['search_mode']) ? $_GET['search_mode'] : 'any'; // 'any' or 'all'

// Build SQL query
$conditions = [];

// Domain condition
if ($domain_filter > 0) {
    $conditions['domain'] = "p.domain_id = $domain_filter";
}

// Experience level condition
if ($experience_filter != '') {
    $safe_exp = $conn->real_escape_string($experience_filter);
    $conditions['experience'] = "p.experience_level = '$safe_exp'";
}

// Project name condition (fuzzy: LIKE + SOUNDEX)
if ($project_name != '') {
    $safe_name = $conn->real_escape_string($project_name);
    $words = explode(' ', $project_name);
    $name_conditions = [];

    // LIKE match for each word
    foreach ($words as $word) {
        $word = $conn->real_escape_string(trim($word));
        if ($word != '') {
            $name_conditions[] = "LOWER(p.title) LIKE LOWER('%$word%')";
        }
    }

    // SOUNDEX match for full phrase
    $name_conditions[] = "SOUNDEX(p.title) = SOUNDEX('$safe_name')";

    $conditions['name'] = '(' . implode(' OR ', $name_conditions) . ')';
}

// Skills conditions
$skill_conditions = [];
if (!empty($selected_skills)) {
    foreach ($selected_skills as $skill_name) {
        $skill_name = $conn->real_escape_string($skill_name);
        if ($skill_name != '') {
            $skill_check = $conn->query("SELECT id FROM skills WHERE LOWER(name) = LOWER('$skill_name')");
            if ($skill_check && $skill_check->num_rows > 0) {
                $skill_row = $skill_check->fetch_assoc();
                $skill_id = $skill_row['id'];
                $skill_conditions[] = "EXISTS (SELECT 1 FROM project_skills ps2 WHERE ps2.project_id = p.id AND ps2.skill_id = $skill_id)";
            }
        }
    }
}

// Base SQL
$base_sql = "SELECT DISTINCT p.id, p.title, p.description, p.experience_level, p.status, d.name as domain_name
             FROM projects p
             JOIN domains d ON p.domain_id = d.id
             LEFT JOIN project_skills ps ON p.id = ps.project_id
             LEFT JOIN skills s ON ps.skill_id = s.id
             WHERE 1=1";

if ($search_mode === 'all') {
    // AND mode: all selected filters must match
    $all_conditions = array_values($conditions);
    if (!empty($skill_conditions)) {
        // Each skill must be present
        foreach ($skill_conditions as $sc) {
            $all_conditions[] = $sc;
        }
    }
    $where = !empty($all_conditions) ? ' AND ' . implode(' AND ', $all_conditions) : '';
} else {
    // OR mode: any condition matching shows the project
    $all_or_conditions = array_values($conditions);
    if (!empty($skill_conditions)) {
        $all_or_conditions[] = '(' . implode(' OR ', $skill_conditions) . ')';
    }
    $where = !empty($all_or_conditions) ? ' AND (' . implode(' OR ', $all_or_conditions) . ')' : '';
}

$sql = $base_sql . $where;
$projects_result = $conn->query($sql);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Search Projects</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 20px auto;
            padding: 0 20px;
        }
        .skill-tag {
            display: inline-block;
            background: #e0e0e0;
            padding: 5px 10px;
            margin: 5px;
            border-radius: 15px;
            position: relative;
        }
        .skill-tag .remove {
            margin-left: 8px;
            cursor: pointer;
            color: red;
            font-weight: bold;
        }
        #skillsContainer {
            border: 1px solid #ccc;
            padding: 10px;
            margin: 10px 0;
            min-height: 40px;
            background: #f9f9f9;
            border-radius: 4px;
        }
        .skill-input-group {
            margin: 10px 0;
        }
        #existingSkillsList {
            max-height: 150px;
            overflow-y: auto;
            border: 1px solid #ddd;
            padding: 5px;
            background: white;
        }
        .existing-skill-item {
            padding: 3px 5px;
            cursor: pointer;
            border-radius: 3px;
        }
        .existing-skill-item:hover {
            background: #f0f0f0;
        }
        .search-buttons {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            align-items: center;
            flex-wrap: wrap;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        }
        .btn-any {
            background-color: #4CAF50;
            color: white;
        }
        .btn-any:hover { background-color: #45a049; }

        .btn-all {
            background-color: #2196F3;
            color: white;
        }
        .btn-all:hover { background-color: #1976D2; }

        .btn-clear {
            background-color: #f44336;
            color: white;
        }
        .btn-clear:hover { background-color: #d32f2f; }

        .mode-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: bold;
            margin-left: 10px;
        }
        .mode-any { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
        .mode-all { background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9; }

        .project-card {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 14px 18px;
            margin-bottom: 14px;
            background: #fafafa;
        }
        .project-card h4 { margin: 0 0 6px 0; color: #333; }
        .project-meta { font-size: 13px; color: #666; margin-bottom: 6px; }
        .project-desc { font-size: 14px; color: #444; }

        input[type="text"], select {
            padding: 7px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
        }
        label { font-weight: bold; }
        .filter-row { margin-bottom: 14px; }
        .hint { font-size: 12px; color: #888; margin-top: 3px; }
    </style>
</head>
<body>

<h2>🔍 Search Projects</h2>

<form method="GET" id="searchForm">
    <input type="hidden" name="search_mode" id="searchModeInput" value="<?= htmlspecialchars($search_mode) ?>">

    <!-- Project Name Search -->
    <div class="filter-row">
        <label>Project Name:</label><br>
        <input type="text" name="project_name" value="<?= htmlspecialchars($project_name) ?>" placeholder="Search by name (fuzzy match supported)" style="width: 320px;">
        <div class="hint">Case-insensitive. Partial and phonetic matches supported.</div>
    </div>

    <!-- Domain Filter -->
    <div class="filter-row">
        <label>Domain:</label><br>
        <select name="domain_id">
            <option value="0">-- All --</option>
            <?php 
            $domains_result->data_seek(0);
            while($row = $domains_result->fetch_assoc()): 
            ?>
                <option value="<?= $row['id'] ?>" <?= ($domain_filter == $row['id']) ? 'selected' : '' ?>>
                    <?= htmlspecialchars($row['name']) ?>
                </option>
            <?php endwhile; ?>
        </select>
    </div>

    <!-- Experience Level Filter -->
    <div class="filter-row">
        <label>Experience Level:</label><br>
        <select name="experience_level">
            <option value="">-- All --</option>
            <option value="Beginner" <?= ($experience_filter == 'Beginner') ? 'selected' : '' ?>>Beginner</option>
            <option value="Intermediate" <?= ($experience_filter == 'Intermediate') ? 'selected' : '' ?>>Intermediate</option>
            <option value="Advanced" <?= ($experience_filter == 'Advanced') ? 'selected' : '' ?>>Advanced</option>
        </select>
    </div>

    <!-- Skills Filter -->
    <div class="filter-row">
        <label>Required Skills:</label><br>
        <div id="skillsContainer">
            <?php foreach($selected_skills as $skill): ?>
                <?php if(trim($skill) != ''): ?>
                    <span class="skill-tag">
                        <?= htmlspecialchars($skill) ?>
                        <span class="remove" onclick="removeSkill(this)">×</span>
                    </span>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>

        <div class="skill-input-group">
            <label style="font-weight:normal;">Select from Existing Skills:</label><br>
            <input type="text" id="skillSearch" placeholder="Type to filter skills..." style="width: 250px;">
            <div id="existingSkillsList">
                <?php foreach($existing_skills as $id => $name): ?>
                    <div class="existing-skill-item" onclick="addExistingSkill('<?= htmlspecialchars($name, ENT_QUOTES) ?>')">
                        <?= htmlspecialchars($name) ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="skill-input-group">
            <label style="font-weight:normal;">Or Add Custom Skill:</label><br>
            <input type="text" id="newSkillInput" placeholder="e.g. Django, Vue.js" style="width: 250px;">
            <button type="button" class="btn" style="background:#607D8B;color:white;" onclick="addSkill()">+ Add</button>
        </div>
    </div>

    <input type="hidden" name="selected_skills" id="selectedSkills" value="<?= htmlspecialchars(implode(',', $selected_skills)) ?>">

    <!-- Search Buttons -->
    <div class="search-buttons">
        <button type="button" class="btn btn-any" onclick="submitForm('any')">
            🔎 Search (Match ANY)
        </button>
        <button type="button" class="btn btn-all" onclick="submitForm('all')">
            ✅ Search (Match ALL)
        </button>
        <button type="button" class="btn btn-clear" onclick="clearAll()">
            ✖ Clear All
        </button>
    </div>
    <div class="hint" style="margin-top:8px;">
        <strong>Match ANY</strong>: Shows projects matching <em>at least one</em> filter &nbsp;|&nbsp;
        <strong>Match ALL</strong>: Shows projects matching <em>every</em> selected filter
    </div>
</form>

<hr>

<h3>
    Results
    <?php if($search_mode === 'all'): ?>
        <span class="mode-badge mode-all">Match ALL filters</span>
    <?php elseif(!empty($conditions) || !empty($skill_conditions)): ?>
        <span class="mode-badge mode-any">Match ANY filter</span>
    <?php endif; ?>
</h3>

<?php if($projects_result && $projects_result->num_rows > 0): ?>
    <p style="color:#555;">Found <strong><?= $projects_result->num_rows ?></strong> project(s).</p>
    <?php while($row = $projects_result->fetch_assoc()): ?>
        <div class="project-card">
            <h4><?= htmlspecialchars($row['title']) ?></h4>
            <div class="project-meta">
                📁 Domain: <strong><?= htmlspecialchars($row['domain_name']) ?></strong> &nbsp;|&nbsp;
                🎓 Experience: <strong><?= htmlspecialchars($row['experience_level']) ?></strong> &nbsp;|&nbsp;
                📌 Status: <strong><?= htmlspecialchars($row['status']) ?></strong>
            </div>
            <div class="project-desc"><?= htmlspecialchars($row['description']) ?></div>
        </div>
    <?php endwhile; ?>
<?php else: ?>
    <p style="color:#999;">No projects found matching the criteria.</p>
<?php endif; ?>

<script>
function getSelectedSkills() {
    let skills = [];
    document.querySelectorAll('#skillsContainer .skill-tag').forEach(tag => {
        let skillName = tag.childNodes[0].textContent.trim();
        if (skillName) skills.push(skillName);
    });
    return skills;
}

function updateSkillsField() {
    document.getElementById('selectedSkills').value = getSelectedSkills().join(',');
}

function addSkill() {
    let input = document.getElementById('newSkillInput');
    let skillName = input.value.trim();
    if (!skillName) { alert('Please enter a skill name'); return; }
    if (getSelectedSkills().some(s => s.toLowerCase() === skillName.toLowerCase())) {
        alert('This skill is already added'); return;
    }
    appendSkillTag(skillName);
    input.value = '';
    updateSkillsField();
}

function addExistingSkill(skillName) {
    if (getSelectedSkills().some(s => s.toLowerCase() === skillName.toLowerCase())) {
        alert('This skill is already added'); return;
    }
    appendSkillTag(skillName);
    updateSkillsField();
}

function appendSkillTag(skillName) {
    let container = document.getElementById('skillsContainer');
    let tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.innerHTML = skillName + ' <span class="remove" onclick="removeSkill(this)">×</span>';
    container.appendChild(tag);
}

function removeSkill(element) {
    element.parentElement.remove();
    updateSkillsField();
}

function submitForm(mode) {
    document.getElementById('searchModeInput').value = mode;
    updateSkillsField();
    document.getElementById('searchForm').submit();
}

function clearAll() {
    window.location.href = window.location.pathname;
}

document.getElementById('skillSearch').addEventListener('input', function () {
    let filter = this.value.toLowerCase();
    document.querySelectorAll('.existing-skill-item').forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(filter) ? 'block' : 'none';
    });
});

document.getElementById('newSkillInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
});
</script>

</body>
</html>