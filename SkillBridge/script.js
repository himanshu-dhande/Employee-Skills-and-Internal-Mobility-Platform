
"use strict";


// 1. SAMPLE PROJECT DATA
const defaultSkills = [
    { id: 1, name: "Java", category: "Programming", level: "Intermediate" },
    { id: 2, name: "HTML & CSS", category: "Frontend", level: "Advanced" },
    { id: 3, name: "JavaScript", category: "Frontend", level: "Intermediate" },
    { id: 4, name: "SQL", category: "Database", level: "Intermediate" },
    { id: 5, name: "React.js", category: "Frontend", level: "Beginner" }
];

const jobs = [
    {
        id: 101,
        title: "Java Developer",
        department: "Engineering",
        location: "Hybrid",
        type: "Full-time",
        skills: ["Java", "SQL", "Spring Boot"],
        match: 85,
        icon: "☕"
    },
    {
        id: 102,
        title: "Frontend Developer",
        department: "Engineering",
        location: "Remote",
        type: "Full-time",
        skills: ["HTML & CSS", "JavaScript", "React.js"],
        match: 90,
        icon: "⌘"
    },
    {
        id: 103,
        title: "Data Analyst",
        department: "Data",
        location: "On-site",
        type: "Full-time",
        skills: ["SQL", "Python", "Excel"],
        match: 70,
        icon: "▥"
    },
    {
        id: 104,
        title: "Full Stack Developer",
        department: "Engineering",
        location: "Hybrid",
        type: "Full-time",
        skills: ["Java", "React.js", "SQL"],
        match: 80,
        icon: "◇"
    },
    {
        id: 105,
        title: "UI/UX Designer",
        department: "Design",
        location: "Remote",
        type: "Full-time",
        skills: ["Figma", "Prototyping", "Design"],
        match: 55,
        icon: "✳"
    },
    {
        id: 106,
        title: "Backend Developer",
        department: "Engineering",
        location: "Hybrid",
        type: "Full-time",
        skills: ["Java", "Spring Boot", "SQL"],
        match: 82,
        icon: "⌘"
    }
];

const skillWeights = {
    Beginner: 35,
    Intermediate: 65,
    Advanced: 90
};


// 2. APPLICATION STATE
function loadSkills() {
    try {
        const saved = localStorage.getItem("skillbridge-skills");
        return saved ? JSON.parse(saved) : [...defaultSkills];
    } catch (error) {
        return [...defaultSkills];
    }
}

function loadProfile() {
    const fallback = {
        name: "Himanshu Dhande",
        email: "",
        department: "Engineering",
        title: "Software Developer",
        bio: ""
    };

    try {
        const saved = localStorage.getItem("skillbridge-profile");
        return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
    } catch (error) {
        return fallback;
    }
}

function loadApplications() {
    try {
        return JSON.parse(
            localStorage.getItem("skillbridge-applications") || "[]"
        );
    } catch (error) {
        return [];
    }
}

let skills = loadSkills();
let profile = loadProfile();
let applications = loadApplications();
let learningProgress = 65;
let nextSkillId = Math.max(0, ...skills.map(skill => skill.id)) + 1;


// 3. HELPER FUNCTIONS

function saveData() {
    try {
        localStorage.setItem("skillbridge-skills", JSON.stringify(skills));
        localStorage.setItem("skillbridge-profile", JSON.stringify(profile));
        localStorage.setItem(
            "skillbridge-applications",
            JSON.stringify(applications)
        );
        return true;
    } catch (error) {
        showToast("Browser storage is unavailable. Changes may not persist.");
        return false;
    }
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getSkillScore(name) {
    const skill = skills.find(
        item => item.name.toLowerCase() === name.toLowerCase()
    );

    return skill ? skillWeights[skill.level] : 0;
}

function getRoleMatch(job) {
    if (job.skills.length === 0) return 0;

    const total = job.skills.reduce((sum, skill) => {
        return sum + getSkillScore(skill);
    }, 0);

    return Math.round(total / job.skills.length);
}

let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}


// 4. PAGE NAVIGATION

function showPage(pageId) {
    const target = document.getElementById(pageId);

    if (!target || !target.classList.contains("page")) return;

    document.querySelectorAll(".page").forEach(page => {
        page.classList.toggle("active", page.id === pageId);
    });

    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );
    });

    const activeButton = document.querySelector(
        `.nav-link[data-page="${pageId}"]`
    );

    document.getElementById("pageTitle").textContent =
        activeButton ? activeButton.textContent.trim() : "Dashboard";

    document.querySelector(".sidebar").classList.remove("open");

    if (pageId === "dashboard") renderDashboard();
    if (pageId === "skills") renderSkills();
    if (pageId === "jobs") renderJobs();
    if (pageId === "career") renderCareer();
    if (pageId === "profile") renderProfile();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.go);
    });
});

document.getElementById("menuToggle").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
});


// 5. DASHBOARD


function renderDashboard() {
    document.getElementById("welcomeName").textContent =
        profile.name.trim().split(/\s+/)[0] || "Employee";

    document.getElementById("skillCount").textContent = skills.length;
    document.getElementById("matchCount").textContent = jobs.filter(
        job => getRoleMatch(job) >= 50
    ).length;
    document.getElementById("learningPercent").textContent =
        learningProgress + "%";
    document.getElementById("applicationCount").textContent =
        applications.length;

    renderTopSkills();
    renderRecommendedJobs();
}

function renderTopSkills() {
    const container = document.getElementById("topSkills");

    if (!skills.length) {
        container.innerHTML =
            '<div class="empty-state">Add skills to see your overview.</div>';
        return;
    }

    container.innerHTML = skills.slice(0, 5).map(skill => {
        const score = skillWeights[skill.level] || 0;

        return `
            <div class="skill-row">
                <div class="skill-row-top">
                    <strong>${escapeHTML(skill.name)}</strong>
                    <span>${escapeHTML(skill.level)}</span>
                </div>
                <div class="progress-track">
                    <span style="width:${score}%"></span>
                </div>
            </div>
        `;
    }).join("");
}

function renderRecommendedJobs() {
    const container = document.getElementById("recommendedJobs");

    const recommended = jobs
        .map(job => ({ ...job, actualMatch: getRoleMatch(job) }))
        .sort((a, b) => b.actualMatch - a.actualMatch)
        .slice(0, 3);

    container.innerHTML = recommended.map(job => `
        <div class="recommended-item">
            <div class="role-icon">${escapeHTML(job.icon)}</div>
            <div class="recommended-info">
                <strong>${escapeHTML(job.title)}</strong>
                <small>${escapeHTML(job.department)} · ${escapeHTML(job.location)}</small>
            </div>
            <span class="match-label">${job.actualMatch}%</span>
        </div>
    `).join("");
}


// 6. SKILLS MANAGEMENT
function renderSkills() {
    const query = document.getElementById("skillSearch")
        .value.trim().toLowerCase();

    const filtered = skills.filter(skill =>
        skill.name.toLowerCase().includes(query) ||
        skill.category.toLowerCase().includes(query) ||
        skill.level.toLowerCase().includes(query)
    );

    const tbody = document.getElementById("skillsTable");

    if (!filtered.length) {
        tbody.innerHTML = `
            <tr><td colspan="5" class="empty-state">
                No matching skills found.
            </td></tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(skill => {
        const score = skillWeights[skill.level] || 0;

        return `
            <tr>
                <td>
                    <div class="skill-name-cell">
                        <div class="skill-symbol">${escapeHTML(skill.name.charAt(0).toUpperCase())}</div>
                        <strong>${escapeHTML(skill.name)}</strong>
                    </div>
                </td>
                <td>${escapeHTML(skill.category)}</td>
                <td>
                    <div class="progress-track" style="width:100px;margin:0">
                        <span style="width:${score}%"></span>
                    </div>
                </td>
                <td><span class="pill ${
                    skill.level === "Advanced" ? "completed" :
                    skill.level === "Intermediate" ? "in-progress" :
                    "upcoming"
                }">${escapeHTML(skill.level)}</span></td>
                <td>
                    <button class="delete-btn" data-delete-skill="${skill.id}">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    document.querySelectorAll("[data-delete-skill]").forEach(button => {
        button.addEventListener("click", () => {
            removeSkill(Number(button.dataset.deleteSkill));
        });
    });
}

document.getElementById("skillSearch").addEventListener("input", renderSkills);

const skillModal = document.getElementById("skillModal");

function openSkillModal() {
    document.getElementById("skillForm").reset();
    skillModal.classList.add("show");
    document.getElementById("newSkill").focus();
}

function closeSkillModal() {
    skillModal.classList.remove("show");
}

document.getElementById("addSkillBtn").addEventListener("click", openSkillModal);
document.getElementById("closeModal").addEventListener("click", closeSkillModal);
document.getElementById("cancelModal").addEventListener("click", closeSkillModal);

skillModal.addEventListener("click", event => {
    if (event.target === skillModal) closeSkillModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeSkillModal();
});

document.getElementById("skillForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("newSkill").value.trim();
    const category = document.getElementById("newCategory").value;
    const level = document.getElementById("newLevel").value;

    if (!name) return;

    const duplicate = skills.some(
        skill => skill.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
        showToast("This skill is already in your profile.");
        return;
    }

    skills.push({
        id: nextSkillId++,
        name,
        category,
        level
    });

    saveData();
    closeSkillModal();
    renderSkills();
    renderDashboard();
    showToast("Skill added successfully!");
});

function removeSkill(id) {
    const skill = skills.find(item => item.id === id);
    if (!skill) return;

    skills = skills.filter(item => item.id !== id);
    saveData();
    renderSkills();
    renderDashboard();
    showToast(`${skill.name} removed from your profile.`);
}


// 7. INTERNAL JOB OPPORTUNITIES
function renderJobs() {
    const query = document.getElementById("jobSearch")
        .value.trim().toLowerCase();

    const department = document.getElementById("departmentFilter").value;

    const filtered = jobs.filter(job => {
        const matchesSearch =
            job.title.toLowerCase().includes(query) ||
            job.department.toLowerCase().includes(query) ||
            job.skills.some(skill => skill.toLowerCase().includes(query));

        const matchesDepartment =
            department === "All" || job.department === department;

        return matchesSearch && matchesDepartment;
    });

    const container = document.getElementById("jobGrid");

    if (!filtered.length) {
        container.innerHTML = `
            <div class="empty-state">No opportunities match your search.</div>
        `;
        return;
    }

    container.innerHTML = filtered.map(job => {
        const applied = applications.includes(job.id);
        const match = getRoleMatch(job);

        return `
            <article class="job-card">
                <div class="job-card-top">
                    <div class="role-icon">${escapeHTML(job.icon)}</div>
                    <span class="match-label">${match}% skill match</span>
                </div>
                <h3>${escapeHTML(job.title)}</h3>
                <p class="job-dept">${escapeHTML(job.department)} Department</p>
                <div class="job-meta">
                    <span>⌖ ${escapeHTML(job.location)}</span>
                    <span>◷ ${escapeHTML(job.type)}</span>
                </div>
                <div class="job-skills">
                    ${job.skills.map(skill =>
                        `<span>${escapeHTML(skill)}</span>`
                    ).join("")}
                </div>
                <div class="job-card-bottom">
                    <small>Suggested skill match</small>
                    <button class="apply-btn" data-apply="${job.id}" ${applied ? "disabled" : ""}>
                        ${applied ? "Applied ✓" : "Apply now →"}
                    </button>
                </div>
            </article>
        `;
    }).join("");

    document.querySelectorAll("[data-apply]").forEach(button => {
        button.addEventListener("click", () => {
            applyForJob(Number(button.dataset.apply));
        });
    });
}

document.getElementById("jobSearch").addEventListener("input", renderJobs);
document.getElementById("departmentFilter").addEventListener("change", renderJobs);

function applyForJob(jobId) {
    const job = jobs.find(item => item.id === jobId);
    if (!job || applications.includes(jobId)) return;

    applications.push(jobId);
    saveData();
    renderJobs();
    renderDashboard();

    showToast(`Demo application recorded for ${job.title}.`);
}


// 8. CAREER GROWTH

function renderCareer() {
    document.getElementById("careerProgressBar").style.width =
        learningProgress + "%";

    document.getElementById("careerProgressText").textContent =
        learningProgress + "% complete";

    const requiredSkills = [
        { name: "Java", target: 75 },
        { name: "Spring Boot", target: 65 },
        { name: "SQL", target: 70 },
        { name: "React.js", target: 60 },
        { name: "REST APIs", target: 65 }
    ];

    document.getElementById("gapList").innerHTML =
        requiredSkills.map(item => {
            const current = getSkillScore(item.name);
            const gap = Math.max(0, item.target - current);

            return `
                <div class="gap-row">
                    <strong>${escapeHTML(item.name)}</strong>
                    <div class="progress-track">
                        <span style="width:${Math.min(100, current)}%"></span>
                    </div>
                    <small>${gap === 0 ? "Target met" : `${gap}% gap`}</small>
                </div>
            `;
        }).join("");
}

document.getElementById("progressBtn").addEventListener("click", () => {
    if (learningProgress >= 100) {
        showToast("Your learning target is complete!");
        return;
    }

    learningProgress = Math.min(100, learningProgress + 10);
    renderCareer();
    document.getElementById("learningPercent").textContent =
        learningProgress + "%";

    showToast("Demo learning progress updated.");
});


// 9. EMPLOYEE PROFILE

function renderProfile() {
    document.getElementById("fullName").value = profile.name;
    document.getElementById("email").value = profile.email;
    document.getElementById("profileDepartment").value = profile.department;
    document.getElementById("jobTitle").value = profile.title;
    document.getElementById("bio").value = profile.bio;

    document.getElementById("sideName").textContent =
        profile.name || "Employee";

    document.getElementById("profileDisplayName").textContent =
        profile.name || "Employee";

    const initials = (profile.name.trim().split(/\s+/).slice(0, 2)
        .map(word => word[0] || "").join("") || "E").toUpperCase();

    document.querySelectorAll(".avatar").forEach(avatar => {
        avatar.textContent = initials;
    });

    document.querySelector(".user-mini small").textContent =
        profile.title || "Employee";
}

document.getElementById("profileForm").addEventListener("submit", event => {
    event.preventDefault();

    profile = {
        name: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        department: document.getElementById("profileDepartment").value,
        title: document.getElementById("jobTitle").value.trim(),
        bio: document.getElementById("bio").value.trim()
    };

    saveData();
    renderProfile();
    renderDashboard();

    document.getElementById("profileMessage").textContent =
        "Profile saved successfully.";

    showToast("Your profile has been updated.");
});


// 10. INITIALIZE APPLICATION
renderProfile();
renderDashboard();
renderSkills();
renderJobs();
renderCareer();
