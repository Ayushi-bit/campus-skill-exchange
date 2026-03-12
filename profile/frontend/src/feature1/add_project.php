<?php
include "../../../backend/api/config.php";
$conn = getConnection();

$posted_by = 1; // Replace with session user ID

$success_message = '';
$error_message   = '';

if (isset($_POST['submit'])) {

    $title            = $conn->real_escape_string(trim($_POST['title']));
    $description      = $conn->real_escape_string(trim($_POST['description']));
    $domain_id        = (int)$_POST['domain_id'];
    $experience_level = $conn->real_escape_string($_POST['experience_level']);
    $status           = $conn->real_escape_string($_POST['status']);

    $selected_skill_ids = isset($_POST['skills'])     ? $_POST['skills']     : [];
    $new_skills_input   = isset($_POST['new_skills']) ? trim($_POST['new_skills']) : '';
    $new_skills         = array_filter(array_map('trim', explode(',', $new_skills_input)));

    // INSERT — only columns that exist in your projects table
    $sql = "INSERT INTO projects
                (title, description, domain_id, posted_by, experience_level, status)
            VALUES
                ('$title', '$description', $domain_id, $posted_by,
                 '$experience_level', '$status')";

    if ($conn->query($sql) === TRUE) {
        $project_id = $conn->insert_id;

        // Link existing skills by ID
        foreach ($selected_skill_ids as $skill_id) {
            $skill_id = (int)$skill_id;
            if ($skill_id > 0) {
                $conn->query("INSERT IGNORE INTO project_skills (project_id, skill_id)
                              VALUES ($project_id, $skill_id)");
            }
        }

        // Add new skills if not exist, then link
        foreach ($new_skills as $skill_name) {
            $skill_name_safe = $conn->real_escape_string($skill_name);
            if ($skill_name_safe === '') continue;

            $res = $conn->query("SELECT id FROM skills WHERE LOWER(name) = LOWER('$skill_name_safe')");
            if ($res && $res->num_rows > 0) {
                $skill_id = $res->fetch_assoc()['id'];
            } else {
                $conn->query("INSERT INTO skills (name) VALUES ('$skill_name_safe')");
                $skill_id = $conn->insert_id;
            }
            $conn->query("INSERT IGNORE INTO project_skills (project_id, skill_id)
                          VALUES ($project_id, $skill_id)");
        }

        $success_message = "Project <strong>" . htmlspecialchars($title) . "</strong> added successfully!";

    } else {
        $error_message = "Database error: " . $conn->error;
    }
}

// Fetch domains and skills
$domains_result = $conn->query("SELECT id, name FROM domains ORDER BY name");
$skills_result  = $conn->query("SELECT id, name FROM skills ORDER BY name");
$existing_skills = [];
while ($row = $skills_result->fetch_assoc()) {
    $existing_skills[$row['id']] = $row['name'];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Add Project — Campus Skill Exchange</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg:       #0c0f1a;
    --surface:  #131729;
    --surface2: #1a1f35;
    --border:   #252c47;
    --accent:   #4f8aff;
    --accent2:  #9b72ff;
    --green:    #36d6a0;
    --yellow:   #f5c842;
    --red:      #ff6b7a;
    --text:     #dde3f5;
    --muted:    #7a85a3;
    --radius:   10px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    padding: 36px 20px 60px;
  }

  .wrap { max-width: 800px; margin: 0 auto; }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .page-header h2 {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    background: linear-gradient(120deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--muted);
    text-decoration: none;
    font-size: 13px;
    transition: color .2s, border-color .2s;
  }
  .back-btn:hover { color: var(--text); border-color: var(--accent); }

  .alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 18px;
    border-radius: var(--radius);
    margin-bottom: 22px;
    font-size: 14px;
  }
  .alert-success {
    background: rgba(54,214,160,.1);
    border: 1px solid rgba(54,214,160,.3);
    color: var(--green);
  }
  .alert-error {
    background: rgba(255,107,122,.1);
    border: 1px solid rgba(255,107,122,.3);
    color: var(--red);
  }
  .alert a { color: var(--accent); font-weight: 600; text-decoration: none; }
  .alert a:hover { text-decoration: underline; }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
  }

  .section-heading {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
    margin: 28px 0 20px;
  }
  .section-heading:first-child { margin-top: 0; }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .full { grid-column: 1 / -1; }

  .field { display: flex; flex-direction: column; gap: 6px; }

  .field-label {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .field-label .req { color: var(--accent2); }

  input[type="text"],
  textarea,
  select {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    padding: 10px 13px;
    width: 100%;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    -webkit-appearance: none;
  }
  input:focus, textarea:focus, select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(79,138,255,.13);
  }
  textarea { min-height: 100px; resize: vertical; line-height: 1.5; }
  select option { background: #1a1f35; }

  .hint { font-size: 11px; color: var(--muted); }

  /* Experience level radio pills */
  .level-group { display: flex; gap: 10px; flex-wrap: wrap; }
  .level-opt { position: relative; }
  .level-opt input[type="radio"] { position: absolute; opacity: 0; width: 0; height: 0; }
  .level-opt label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border: 1px solid var(--border);
    border-radius: 22px;
    background: var(--surface2);
    color: var(--muted);
    font-size: 13px;
    cursor: pointer;
    transition: all .2s;
    user-select: none;
  }
  .level-opt.beginner     input:checked + label { border-color: var(--green);  background: rgba(54,214,160,.12); color: var(--text); font-weight: 500; }
  .level-opt.intermediate input:checked + label { border-color: var(--yellow); background: rgba(245,200,66,.12); color: var(--text); font-weight: 500; }
  .level-opt.advanced     input:checked + label { border-color: var(--red);    background: rgba(255,107,122,.12); color: var(--text); font-weight: 500; }
  .level-opt label:hover { border-color: var(--accent); color: var(--text); }

  .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .dot-g { background: var(--green); }
  .dot-y { background: var(--yellow); }
  .dot-r { background: var(--red); }

  /* Status radio pills */
  .status-group { display: flex; gap: 10px; flex-wrap: wrap; }
  .status-opt { position: relative; }
  .status-opt input[type="radio"] { position: absolute; opacity: 0; width: 0; height: 0; }
  .status-opt label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: 22px;
    background: var(--surface2);
    color: var(--muted);
    font-size: 13px;
    cursor: pointer;
    transition: all .2s;
    user-select: none;
  }
  .status-opt input:checked + label {
    border-color: var(--accent);
    background: rgba(79,138,255,.12);
    color: var(--text);
    font-weight: 500;
  }
  .status-opt label:hover { border-color: var(--accent); color: var(--text); }

  /* Skills container */
  #skillsContainer {
    min-height: 46px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    transition: border-color .2s;
  }
  .skill-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(79,138,255,.15);
    border: 1px solid rgba(79,138,255,.35);
    color: #89b4ff;
    padding: 4px 10px 4px 11px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    animation: popIn .15s ease;
  }
  @keyframes popIn {
    from { transform: scale(.6); opacity: 0; }
    to   { transform: scale(1);  opacity: 1; }
  }
  .skill-tag .remove {
    cursor: pointer;
    color: var(--muted);
    font-size: 15px;
    line-height: 1;
    transition: color .15s;
  }
  .skill-tag .remove:hover { color: var(--red); }
  .skills-empty {
    color: var(--muted);
    font-size: 13px;
    font-style: italic;
    padding: 4px 2px;
  }

  /* Skill picker dropdown */
  .picker-wrap { position: relative; }
  #skillSearch {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%237a85a3' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: 11px center;
    padding-left: 32px;
  }
  #skillDropdown {
    display: none;
    position: absolute;
    top: calc(100% + 2px);
    left: 0; right: 0;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 0 0 var(--radius) var(--radius);
    max-height: 180px;
    overflow-y: auto;
    z-index: 50;
  }
  #skillDropdown.open { display: block; }
  .skill-option {
    padding: 8px 14px;
    font-size: 13px;
    color: var(--muted);
    cursor: pointer;
    transition: background .15s, color .15s;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .skill-option:hover { background: rgba(79,138,255,.1); color: var(--text); }
  .skill-option.is-added { color: var(--border); cursor: default; pointer-events: none; }
  .skill-option.is-added::after { content: '✓'; color: var(--green); font-size: 11px; }
  #skillDropdown::-webkit-scrollbar { width: 4px; }
  #skillDropdown::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .custom-row { display: flex; gap: 8px; margin-top: 8px; }
  .custom-row input { flex: 1; }
  .btn-ghost {
    padding: 10px 16px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--accent);
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: all .2s;
  }
  .btn-ghost:hover { border-color: var(--accent); background: rgba(79,138,255,.1); }

  .btn-submit {
    width: 100%;
    margin-top: 28px;
    padding: 14px;
    background: linear-gradient(130deg, var(--accent), var(--accent2));
    border: none;
    border-radius: var(--radius);
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: .04em;
    cursor: pointer;
    transition: opacity .2s, transform .2s, box-shadow .2s;
  }
  .btn-submit:hover {
    opacity: .92;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(79,138,255,.3);
  }
  .btn-submit:active { transform: translateY(0); }

  @media (max-width: 580px) {
    .form-grid { grid-template-columns: 1fr; }
    .full { grid-column: 1; }
    .card { padding: 22px 18px; }
  }
</style>
</head>
<body>
<div class="wrap">

  <div class="page-header">
    <h2>➕ Add New Project</h2>
    <a href="search_projects.php" class="back-btn">← Search Projects</a>
  </div>

  <?php if ($success_message): ?>
    <div class="alert alert-success">
      ✅ <?= $success_message ?> &nbsp;—&nbsp;
      <a href="search_projects.php">Browse Projects</a> &nbsp;|&nbsp;
      <a href="add_project.php">Add Another</a>
    </div>
  <?php endif; ?>
  <?php if ($error_message): ?>
    <div class="alert alert-error">⚠️ <?= $error_message ?></div>
  <?php endif; ?>

  <div class="card">
  <form method="POST" id="projectForm">

    <!-- BASIC INFO -->
    <div class="section-heading">📋 Basic Information</div>
    <div class="form-grid">

      <div class="field full">
        <label class="field-label">Project Title <span class="req">*</span></label>
        <input type="text" name="title" required placeholder="e.g. Campus Event Finder"
               value="<?= isset($_POST['title']) ? htmlspecialchars($_POST['title']) : '' ?>">
      </div>

      <div class="field full">
        <label class="field-label">Domain <span class="req">*</span></label>
        <select name="domain_id" required>
          <option value="" disabled selected>Select domain…</option>
          <?php
          $domains_result->data_seek(0);
          while ($row = $domains_result->fetch_assoc()):
          ?>
            <option value="<?= $row['id'] ?>"
              <?= (isset($_POST['domain_id']) && $_POST['domain_id'] == $row['id']) ? 'selected' : '' ?>>
              <?= htmlspecialchars($row['name']) ?>
            </option>
          <?php endwhile; ?>
        </select>
      </div>

      <div class="field full">
        <label class="field-label">Description <span class="req">*</span></label>
        <textarea name="description" required
                  placeholder="Describe the project goals, what contributors will learn…"><?= isset($_POST['description']) ? htmlspecialchars($_POST['description']) : '' ?></textarea>
      </div>

    </div>

    <!-- EXPERIENCE & STATUS -->
    <div class="section-heading">🎓 Experience Level &amp; Status</div>
    <div class="form-grid">

      <div class="field full">
        <label class="field-label">Experience Level <span class="req">*</span></label>
        <div class="level-group">
          <?php
          $levels = [
            'Beginner'     => ['beginner',     'dot-g'],
            'Intermediate' => ['intermediate', 'dot-y'],
            'Advanced'     => ['advanced',     'dot-r'],
          ];
          foreach ($levels as $val => [$cls, $dot]):
            $checked = (isset($_POST['experience_level']) && $_POST['experience_level'] === $val) ? 'checked' : '';
          ?>
            <div class="level-opt <?= $cls ?>">
              <input type="radio" name="experience_level" id="lvl_<?= $val ?>" value="<?= $val ?>" <?= $checked ?> required>
              <label for="lvl_<?= $val ?>">
                <span class="dot <?= $dot ?>"></span><?= $val ?>
              </label>
            </div>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="field full">
        <label class="field-label">Project Status</label>
        <div class="status-group">
          <?php
          $statuses = [
            'open'        => '🟢 Open',
            'in_progress' => '🔵 In Progress',
            'completed'   => '✅ Completed',
            'closed'      => '🔒 Closed',
          ];
          foreach ($statuses as $val => $label):
            $checked = (!isset($_POST['status']) && $val === 'open') ? 'checked'
                     : ((isset($_POST['status']) && $_POST['status'] === $val) ? 'checked' : '');
          ?>
            <div class="status-opt">
              <input type="radio" name="status" id="st_<?= $val ?>" value="<?= $val ?>" <?= $checked ?>>
              <label for="st_<?= $val ?>"><?= $label ?></label>
            </div>
          <?php endforeach; ?>
        </div>
      </div>

    </div>

    <!-- SKILLS -->
    <div class="section-heading">🛠 Required Skills</div>
    <div class="form-grid">

      <div class="field full">
        <label class="field-label">Selected Skills</label>
        <div id="skillsContainer">
          <span class="skills-empty">No skills added yet…</span>
        </div>
        <input type="hidden" name="new_skills" id="newSkillsHidden">
        <div id="skillIdInputs"></div>
      </div>

      <div class="field">
        <label class="field-label">Pick from Existing Skills</label>
        <div class="picker-wrap">
          <input type="text" id="skillSearch" placeholder="Search skills…" autocomplete="off">
          <div id="skillDropdown">
            <?php foreach ($existing_skills as $id => $name): ?>
              <div class="skill-option"
                   data-id="<?= $id ?>"
                   data-name="<?= htmlspecialchars($name, ENT_QUOTES) ?>">
                <?= htmlspecialchars($name) ?>
              </div>
            <?php endforeach; ?>
          </div>
        </div>
        <span class="hint">Click any skill to add it.</span>
      </div>

      <div class="field">
        <label class="field-label">Add Custom Skill</label>
        <div class="custom-row">
          <input type="text" id="customInput" placeholder="e.g. FastAPI, Three.js…">
          <button type="button" class="btn-ghost" onclick="addCustomSkill()">+ Add</button>
        </div>
        <span class="hint">New skills are added to the skills table automatically.</span>
      </div>

    </div>

    <button type="submit" name="submit" class="btn-submit">🚀 Publish Project</button>

  </form>
  </div>
</div>

<script>
const skills = new Map();

function renderTags() {
  const box = document.getElementById('skillsContainer');
  box.innerHTML = '';
  if (skills.size === 0) {
    box.innerHTML = '<span class="skills-empty">No skills added yet…</span>';
  } else {
    skills.forEach(({ name }, key) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.innerHTML = `${escHtml(name)} <span class="remove" onclick="removeSkill('${key}')">×</span>`;
      box.appendChild(tag);
    });
  }
  syncHidden();
  syncDropdown();
}

function syncHidden() {
  const newNames = [];
  const idBox = document.getElementById('skillIdInputs');
  idBox.innerHTML = '';
  skills.forEach(({ id, name }) => {
    if (id === null) {
      newNames.push(name);
    } else {
      const inp = document.createElement('input');
      inp.type = 'checkbox';
      inp.name = 'skills[]';
      inp.value = id;
      inp.checked = true;
      inp.style.display = 'none';
      idBox.appendChild(inp);
    }
  });
  document.getElementById('newSkillsHidden').value = newNames.join(',');
}

function syncDropdown() {
  document.querySelectorAll('.skill-option').forEach(opt => {
    opt.classList.toggle('is-added', skills.has(opt.dataset.name.toLowerCase()));
  });
}

function addSkill(id, name) {
  const key = name.toLowerCase();
  if (skills.has(key)) return;
  skills.set(key, { id: id !== null ? parseInt(id) : null, name });
  renderTags();
}

function removeSkill(key) {
  skills.delete(key);
  renderTags();
}

function addCustomSkill() {
  const input = document.getElementById('customInput');
  const name  = input.value.trim();
  if (!name) { input.focus(); return; }
  const key = name.toLowerCase();
  if (skills.has(key)) { alert('Already added!'); input.value = ''; return; }
  let matchedId = null;
  document.querySelectorAll('.skill-option').forEach(opt => {
    if (opt.dataset.name.toLowerCase() === key) matchedId = opt.dataset.id;
  });
  skills.set(key, { id: matchedId ? parseInt(matchedId) : null, name });
  input.value = '';
  renderTags();
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Dropdown
const searchInput = document.getElementById('skillSearch');
const dropdown    = document.getElementById('skillDropdown');

searchInput.addEventListener('focus', () => dropdown.classList.add('open'));
searchInput.addEventListener('input', function () {
  const f = this.value.toLowerCase();
  document.querySelectorAll('.skill-option').forEach(opt => {
    opt.style.display = opt.dataset.name.toLowerCase().includes(f) ? 'flex' : 'none';
  });
});
document.addEventListener('click', e => {
  if (!e.target.closest('.picker-wrap')) dropdown.classList.remove('open');
});
document.querySelectorAll('.skill-option').forEach(opt => {
  opt.addEventListener('click', () => {
    addSkill(opt.dataset.id, opt.dataset.name);
    searchInput.value = '';
    dropdown.classList.remove('open');
  });
});

document.getElementById('customInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); }
});

document.getElementById('projectForm').addEventListener('submit', function (e) {
  if (!document.querySelector('input[name="experience_level"]:checked')) {
    e.preventDefault();
    alert('Please select an Experience Level.');
  }
});
</script>
</body>
</html>