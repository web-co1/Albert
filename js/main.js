// all variables
const menuBtn = document.querySelector(".menu-btn");
const analyzeButton = document.getElementById("analyze-button");
const editor = document.getElementById("editor");


/* -- navigation menu starts from here -- */
if(menuBtn){
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    document.body.classList.toggle("is_open");
  });
  
  window.addEventListener("click", () => {
    if (document.body.classList.contains("is_open")) {
      document.body.classList.remove("is_open");
    }
  });
}
document.addEventListener('DOMContentLoaded', function () {
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach((accordion) => {
        const head = accordion.querySelector('.accordion__head');

        head.addEventListener('click', () => {
            // Close all other accordions
            accordions.forEach((item) => {
                if (item !== accordion) {
                    item.classList.remove('active');
                }
            });

            // Toggle current accordion
            accordion.classList.toggle('active');
        });
    });
});
/* -- navigation menu ends from here -- */

/* -- Sepia Theme toggle starts here -- */
    const toggle = document.getElementById('toggle');
    toggle.addEventListener('change', function () {
      if (this.checked) {
        editor.style.backgroundColor = '#f7f3e9';
      } else {
        editor.style.backgroundColor = '#FAFAFA';
      }
    });

/* -- Sepia Theme toggle end here -- */

/* content editable starts from here */

function wrapSelection(style) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);

  // If collapsed (no selection)
  if (range.collapsed) {
    const span = document.createElement("span");
    Object.assign(span.style, style);
    span.appendChild(document.createTextNode("\u200B"));
    range.insertNode(span);

    // Move cursor inside span
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStart(span.firstChild, 0);
    newRange.collapse(true);
    selection.addRange(newRange);
    return;
  }

  // If selection exists
  let parent = range.commonAncestorContainer;
  if (parent.nodeType === 3) parent = parent.parentNode; 

  if (parent.nodeName === "SPAN") {
    Object.assign(parent.style, style);
  } else {
    const span = document.createElement("span");
    Object.assign(span.style, style);

    try {
      range.surroundContents(span);
    } catch {
      const extracted = range.extractContents();
      span.appendChild(extracted);
      range.insertNode(span);
    }
  }
}

// Font size
document.getElementById("fontSize").addEventListener("change", (e) => {
wrapSelection({ fontSize: e.target.value });
});

// Line height
document.getElementById("lineHeight").addEventListener("change", (e) => {
wrapSelection({ lineHeight: e.target.value });
});

// Bold
document.getElementById("bold").addEventListener("click", (e) => {
  e.preventDefault();
  editor.focus();
  wrapSelection({ fontWeight: "bold" });
});

// Italic
document.getElementById("italic").addEventListener("click", (e) => {
  e.preventDefault();
  editor.focus();
  wrapSelection({ fontStyle: "italic" });
});

// Insert Link
document.getElementById("link").addEventListener("click", () => {
    const url = prompt("Enter URL (include https:// or http://):");
    if (!url) return;
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    if (sel.isCollapsed) {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = url;
        const range = sel.getRangeAt(0);
        range.insertNode(a);
        range.setStartAfter(a);
        sel.removeAllRanges();
        sel.addRange(range);
    } else {
        document.execCommand("createLink", false, url);
    }
});

// Insert @ directly
document.getElementById("mention").addEventListener("click", (e) => {
    e.preventDefault()
    document.execCommand("insertHTML", false, '<span style="color:blue">@</span>&nbsp;');
});

// Insert # directly
document.getElementById("hashtag").addEventListener("click", (e) => {
    e.preventDefault();
    document.execCommand("insertHTML", false, '<span style="color:green">#</span>&nbsp;');
});

// Toolbar state (Bold/Italic active)
function updateToolbarState() {
    const boldBtn = document.getElementById("bold");
    const italicBtn = document.getElementById("italic");
    try {
        boldBtn.classList.toggle("active", document.queryCommandState("bold"));
        italicBtn.classList.toggle("active", document.queryCommandState("italic"));
    } catch {}
}

document.addEventListener("selectionchange", () => {
    if (editor.contains(window.getSelection().anchorNode)) {
        updateToolbarState();
    }
});

/* get data from analyze button */

editor.addEventListener("input", function(){
    let text = editor.textContent.trim();
    document.getElementById("char-counter").textContent = text.length;
    if(text.length >= 70 ) {
        document.querySelector(".char-counter").style.display = "none";
        analyzeButton.disabled = false;
    }else {
        analyzeButton.disabled = true;
        document.querySelector(".char-counter").style.display = "block";
    }
})

analyzeButton.addEventListener("click", function(e){
    e.preventDefault();
    let editorText = editor.textContent.toString();
    let plateform = document.querySelector('[name="social_media"]:checked').value;
    let recaptchaSiteKey = "6LefJYcrAAAAAF7hmQfCgy73gHwy1HwSmW1bWZ_B";
    analyzeText(editorText, recaptchaSiteKey, plateform, false);

})


/* accordion open and close */

function dropdownAccordion(){
  document.querySelectorAll(".result_detail .card__header").forEach(function(header){
      header.addEventListener("click", function(){
          document.querySelectorAll(".result_detail .card__header").forEach(function(header){
              header.parentElement.classList.remove("accordion_open")
          });
          header.parentElement.classList.add("accordion_open")
      })
      
  })
}

