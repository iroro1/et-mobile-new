// Global variables
let currentModule = "overview";
let completedModules = new Set(["overview"]);
let progress = 0;
let quizScores = {};
let userAnswers = {};

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
  updateProgress();
});

function initializeApp() {
  // Show the overview module by default
  showModule("overview");

  // Add loading animation to modules that aren't loaded yet
  const modules = document.querySelectorAll(".module:not(.active)");
  modules.forEach((module) => {
    module.innerHTML +=
      '<div class="loading-overlay"><div class="loading"></div></div>';
  });
}

function setupEventListeners() {
  // Navigation click handlers
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const moduleName = this.dataset.module;
      showModule(moduleName);
      updateNavigation(this);
    });
  });

  // Tech stack item click handlers
  const techItems = document.querySelectorAll(".tech-item");
  techItems.forEach((item) => {
    item.addEventListener("click", function () {
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
    });
  });

  // Quiz option click handlers
  const quizOptions = document.querySelectorAll(".quiz-option");
  quizOptions.forEach((option) => {
    option.addEventListener("click", function () {
      handleQuizAnswer(this);
    });
  });

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      navigateModules(e.key === "ArrowRight" ? "next" : "prev");
    }
  });
}

function showModule(moduleName) {
  // Hide all modules
  const modules = document.querySelectorAll(".module");
  modules.forEach((module) => {
    module.classList.remove("active");
  });

  // Show selected module
  const targetModule = document.getElementById(moduleName);
  if (targetModule) {
    targetModule.classList.add("active");
    currentModule = moduleName;

    // Mark module as completed
    completedModules.add(moduleName);

    // Update progress
    updateProgress();

    // Add completion animation
    targetModule.style.animation = "fadeIn 0.3s ease";

    // Load module content if not already loaded
    loadModuleContent(moduleName);
  }
}

function updateNavigation(activeItem) {
  // Remove active class from all nav items
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  // Add active class to clicked item
  activeItem.classList.add("active");
}

function updateProgress() {
  const totalModules = 12; // Total number of modules
  const completedCount = completedModules.size;
  progress = Math.round((completedCount / totalModules) * 100);

  // Update progress bar
  const progressBar = document.querySelector(".progress");
  const progressText = document.querySelector(".progress-text");

  if (progressBar && progressText) {
    progressBar.style.setProperty("--progress", `${progress}%`);
    progressText.textContent = `${progress}% Complete`;
  }

  // Add celebration animation when reaching 100%
  if (progress === 100) {
    celebrateCompletion();
  }
}

function loadModuleContent(moduleName) {
  // Simulate loading content (in a real app, this would fetch from server)
  setTimeout(() => {
    const module = document.getElementById(moduleName);
    if (module) {
      // Remove loading overlay if it exists
      const loadingOverlay = module.querySelector(".loading-overlay");
      if (loadingOverlay) {
        loadingOverlay.remove();
      }
    }
  }, 500);
}

function navigateModules(direction) {
  const moduleOrder = [
    "overview",
    "vue",
    "react",
    "nodejs",
    "database",
    "azure",
    "react-native",
    "system-design",
    "behavioral",
    "virtual-tips",
    "company-info",
    "final-prep",
  ];

  const currentIndex = moduleOrder.indexOf(currentModule);
  let nextIndex;

  if (direction === "next") {
    nextIndex = (currentIndex + 1) % moduleOrder.length;
  } else {
    nextIndex = (currentIndex - 1 + moduleOrder.length) % moduleOrder.length;
  }

  const nextModule = moduleOrder[nextIndex];
  showModule(nextModule);

  // Update navigation
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.module === nextModule) {
      item.classList.add("active");
    }
  });
}

function handleQuizAnswer(selectedOption) {
  // Remove any existing feedback
  const quizItem = selectedOption.closest(".quiz-item");
  const options = quizItem.querySelectorAll(".quiz-option");
  options.forEach((option) => {
    option.classList.remove("correct", "incorrect");
    option.disabled = true;
  });

  // Check if answer is correct (this would be determined by your quiz logic)
  const isCorrect = Math.random() > 0.5; // Simulate random correct/incorrect

  if (isCorrect) {
    selectedOption.classList.add("correct");
    showFeedback("Correct! 🎉", "success");
  } else {
    selectedOption.classList.add("incorrect");
    showFeedback("Not quite right. Try again! 💪", "error");

    // Re-enable options after a delay
    setTimeout(() => {
      options.forEach((option) => {
        option.disabled = false;
        option.classList.remove("incorrect");
      });
    }, 2000);
  }
}

function showFeedback(message, type) {
  // Create feedback element
  const feedback = document.createElement("div");
  feedback.className = `feedback ${type}`;
  feedback.textContent = message;
  feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        background: ${type === "success" ? "#28a745" : "#dc3545"};
    `;

  document.body.appendChild(feedback);

  // Remove feedback after 3 seconds
  setTimeout(() => {
    feedback.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      feedback.remove();
    }, 300);
  }, 3000);
}

function celebrateCompletion() {
  // Create celebration effect
  const celebration = document.createElement("div");
  celebration.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.5s ease;
        ">
            <div style="
                background: white;
                padding: 3rem;
                border-radius: 20px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                animation: scaleIn 0.5s ease;
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                <h2 style="color: #2c3e50; margin-bottom: 1rem;">Congratulations!</h2>
                <p style="color: #6c757d; font-size: 1.1rem; margin-bottom: 2rem;">
                    You've completed all preparation modules!
                </p>
                <button onclick="this.closest('div').remove()" style="
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                " onmouseover="this.style.transform='scale(1.05)'" 
                   onmouseout="this.style.transform='scale(1)'">
                    Awesome! 🚀
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(celebration);

  // Add confetti effect
  createConfetti();
}

function createConfetti() {
  const colors = ["#f39c12", "#e74c3c", "#3498db", "#2ecc71", "#9b59b6"];

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${
                  colors[Math.floor(Math.random() * colors.length)]
                };
                top: -10px;
                left: ${Math.random() * 100}%;
                z-index: 2001;
                animation: fall 3s linear forwards;
            `;

      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }, i * 50);
  }
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes scaleIn {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
    
    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }
`;
document.head.appendChild(style);

// Global function for quiz answers (used in HTML)
function showAnswer(element, message) {
  const isCorrect = !message.includes("Incorrect");

  // Remove existing classes
  const quizOptions = element
    .closest(".quiz-options")
    .querySelectorAll(".quiz-option");
  quizOptions.forEach((option) => {
    option.classList.remove("correct", "incorrect");
    option.disabled = true;
  });

  // Add appropriate class
  element.classList.add(isCorrect ? "correct" : "incorrect");

  // Show feedback
  showFeedback(message, isCorrect ? "success" : "error");

  // Re-enable options after delay if incorrect
  if (!isCorrect) {
    setTimeout(() => {
      quizOptions.forEach((option) => {
        option.disabled = false;
        option.classList.remove("incorrect");
      });
    }, 2000);
  }
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Search functionality (if needed)
function searchModules(query) {
  const modules = document.querySelectorAll(".module");
  const navItems = document.querySelectorAll(".nav-item");

  if (!query.trim()) {
    // Show all modules
    modules.forEach((module) => (module.style.display = ""));
    navItems.forEach((item) => (item.style.display = ""));
    return;
  }

  const searchTerm = query.toLowerCase();

  modules.forEach((module) => {
    const content = module.textContent.toLowerCase();
    module.style.display = content.includes(searchTerm) ? "" : "none";
  });

  navItems.forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// Export functions for potential external use
window.InterviewPrep = {
  showModule,
  navigateModules,
  updateProgress,
  searchModules,
};
