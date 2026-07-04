/**
 * Generates a styled, accessible question block with radio options.
 * Matches the premium UI styling patterns of the wellness tracker.
 * 
 * @param {string} questionText - The question text to display.
 * @param {number} questionIndex - The 0-based index of the question.
 * @param {Array<{label: string, value: number}>} options - The selectable answers.
 * @param {string} namePrefix - Prefix for the input field name attributes.
 * @returns {HTMLElement} - The fully constructed DOM node for the question.
 */
export function createAssessmentQuestion(questionText, questionIndex, options, namePrefix = "q") {
  const container = document.createElement("div");
  container.className = "flex flex-col gap-3 pb-6 border-b border-cream-border/50 question-block";
  container.dataset.index = questionIndex;

  container.innerHTML = `
    <div class="flex gap-3">
      <span class="font-mono text-sm text-orange font-semibold">${questionIndex + 1}.</span>
      <p class="text-sm md:text-base font-medium text-warm-dark leading-relaxed">${questionText}</p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-1 pl-6">
      ${options.map(opt => `
        <label class="flex items-center gap-3 p-3 rounded-lg border border-cream-border/60 bg-cream/10 hover:bg-orange/5 hover:border-orange/30 cursor-pointer transition-all duration-150 select-none">
          <input 
            type="radio" 
            name="${namePrefix}-${questionIndex}" 
            value="${opt.value}" 
            class="w-4 h-4 accent-orange cursor-pointer"
            required
          />
          <span class="text-xs md:text-sm text-warm-dark">${opt.label}</span>
        </label>
      `).join("")}
    </div>
  `;

  return container;
}
