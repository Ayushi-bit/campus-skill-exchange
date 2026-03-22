<?php
// ============================================================
//  NOTIFICATION BELL COMPONENT
//  File: notifications/frontend/notifications.php
//  Include this in any page that needs notifications:
//  <?php include 'notifications/frontend/notifications.php'; ?>
// ============================================================
?>

<!-- Notification Bell CSS -->
<style>
.notif-wrapper {
    position: relative;
    display: inline-block;
}

.notif-bell {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 22px;
    position: relative;
    padding: 5px;
}

.notif-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: #e74c3c;
    color: white;
    border-radius: 50%;
    font-size: 10px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    display: none;
}

.notif-dropdown {
    display: none;
    position: absolute;
    right: 0;
    top: 40px;
    width: 320px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 9999;
    overflow: hidden;
}

.notif-dropdown.open {
    display: block;
}

.notif-header {
    padding: 15px;
    font-weight: bold;
    font-size: 14px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
}

.notif-header span {
    color: #3498db;
    cursor: pointer;
    font-weight: normal;
    font-size: 12px;
}

.notif-list {
    max-height: 350px;
    overflow-y: auto;
}

.notif-item {
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    transition: background 0.2s;
}

.notif-item:hover {
    background: #f8f9fa;
}

.notif-item.unread {
    background: #eef6ff;
    border-left: 3px solid #3498db;
}

.notif-icon {
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
}

.notif-content {
    flex: 1;
}

.notif-message {
    font-size: 13px;
    color: #333;
    line-height: 1.4;
}

.notif-time {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
}

.notif-empty {
    padding: 30px;
    text-align: center;
    color: #999;
    font-size: 13px;
}
</style>

<!-- Notification Bell HTML -->
<div class="notif-wrapper">
    <button class="notif-bell" onclick="toggleNotifications()" title="Notifications">
        🔔
        <span class="notif-badge" id="notif-badge">0</span>
    </button>

    <div class="notif-dropdown" id="notif-dropdown">
        <div class="notif-header">
            Notifications
            <span onclick="markAllRead()">Mark all as read</span>
        </div>
        <div class="notif-list" id="notif-list">
            <div class="notif-empty">Loading...</div>
        </div>
    </div>
</div>

<!-- Notification JavaScript -->
<script>
// Icons for each notification type
const notifIcons = {
    application_received:  '📩',
    application_accepted:  '✅',
    application_rejected:  '❌',
    new_rating:            '⭐',
    project_completed:     '🏁',
    member_joined:         '👥',
};

function toggleNotifications() {
    const dropdown = document.getElementById('notif-dropdown');
    dropdown.classList.toggle('open');
    if (dropdown.classList.contains('open')) {
        loadNotifications();
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const wrapper = document.querySelector('.notif-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('notif-dropdown').classList.remove('open');
    }
});

function timeAgo(dateStr) {
    const now  = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return Math.floor(diff / 60) + ' min ago';
    if (diff < 86400)  return Math.floor(diff / 3600) + ' hr ago';
    return Math.floor(diff / 86400) + ' days ago';
}

function loadNotifications() {
    fetch('../../notifications/backend/get_notifications.php')
        .then(r => r.json())
        .then(data => {
            const list  = document.getElementById('notif-list');
            const badge = document.getElementById('notif-badge');

            // Update badge
            if (data.unread_count > 0) {
                badge.style.display = 'flex';
                badge.textContent   = data.unread_count > 9 ? '9+' : data.unread_count;
            } else {
                badge.style.display = 'none';
            }

            // Render notifications
            if (!data.notifications || data.notifications.length === 0) {
                list.innerHTML = '<div class="notif-empty">🔕 No notifications yet</div>';
                return;
            }

            list.innerHTML = data.notifications.map(n => `
                <div class="notif-item ${n.is_read == 0 ? 'unread' : ''}"
                     onclick="markRead(${n.id}, this)">
                    <div class="notif-icon">${notifIcons[n.type] || '🔔'}</div>
                    <div class="notif-content">
                        <div class="notif-message">${n.message}</div>
                        <div class="notif-time">${timeAgo(n.created_at)}</div>
                    </div>
                </div>
            `).join('');
        })
        .catch(() => {
            document.getElementById('notif-list').innerHTML =
                '<div class="notif-empty">Could not load notifications</div>';
        });
}

function markRead(id, el) {
    fetch('../../notifications/backend/mark_read.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    });
    el.classList.remove('unread');
    // Refresh badge count
    setTimeout(loadNotifications, 300);
}

function markAllRead() {
    fetch('../../notifications/backend/mark_read.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).then(() => loadNotifications());
}

// Auto-refresh notifications every 30 seconds
setInterval(() => {
    fetch('../../notifications/backend/get_notifications.php')
        .then(r => r.json())
        .then(data => {
            const badge = document.getElementById('notif-badge');
            if (data.unread_count > 0) {
                badge.style.display = 'flex';
                badge.textContent   = data.unread_count > 9 ? '9+' : data.unread_count;
            } else {
                badge.style.display = 'none';
            }
        });
}, 30000);

// Load badge count on page load
window.addEventListener('load', () => {
    fetch('../../notifications/backend/get_notifications.php')
        .then(r => r.json())
        .then(data => {
            const badge = document.getElementById('notif-badge');
            if (data.unread_count > 0) {
                badge.style.display = 'flex';
                badge.textContent   = data.unread_count > 9 ? '9+' : data.unread_count;
            }
        });
});
</script>
