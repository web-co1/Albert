// all variables
const menuBtn = document.querySelector(".menu-btn");


/* navigation menu starts from here */
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



/* content editable starts from here */

document.addEventListener('DOMContentLoaded', function() {
            const editor = document.getElementById('editor');
            const boldBtn = document.getElementById('bold-btn');
            const italicBtn = document.getElementById('italic-btn');
            const underlineBtn = document.getElementById('underline-btn');
            const alignLeftBtn = document.getElementById('align-left-btn');
            const alignCenterBtn = document.getElementById('align-center-btn');
            const alignRightBtn = document.getElementById('align-right-btn');
            const bulletListBtn = document.getElementById('bullet-list-btn');
            const numberListBtn = document.getElementById('number-list-btn');
            const colorPicker = document.getElementById('color-picker');
            const fontSelect = document.getElementById('font-select');
            const sizeSelect = document.getElementById('size-select');
            const spellcheckToggle = document.getElementById('spellcheck-toggle');
            const saveBtn = document.getElementById('save-btn');
            
            // Load Google Fonts dynamically
            const loadGoogleFonts = () => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://fonts.googleapis.com/css2?family=' + 
                    'Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700|' +
                    'Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800|' +
                    'Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900|' +
                    'Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900|' +
                    'Roboto+Condensed:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700|' +
                    'Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900|' +
                    'Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900|' +
                    'Oswald:wght@200;300;400;500;600;700|' +
                    'Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900|' +
                    'Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900|' +
                    'PT+Sans:ital,wght@0,400;0,700;1,400;1,700|' +
                    'Nunito:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;0,1000;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900;1,1000|' +
                    'Noto+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900|' +
                    'Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900|' +
                    'Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700|' +
                    'Inter:wght@100;200;300;400;500;600;700;800;900|' +
                    'Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900|' +
                    'Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700|' +
                    'Roboto+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700|' +
                    'Nunito+Sans:ital,wght@0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900|' +
                    'Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900|' +
                    'Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900|' +
                    'Quicksand:wght@300;400;500;600;700|' +
                    'Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700|' +
                    'Muli:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900|' +
                    'Josefin+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700|' +
                    'Libre+Franklin:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900|' +
                    'Cabin:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700|' +
                    'Noto+Serif:ital,wght@0,400;0,700;1,400;1,700|' +
                    'Inconsolata:wght@200;300;400;500;600;700;800;900&display=swap';
                document.head.appendChild(link);
            };
            
            loadGoogleFonts();
            
            // Formatting functions
            function formatText(command, value = null) {
                document.execCommand(command, false, value);
                editor.focus();
                updateActiveButtons();
            }
            
            function updateActiveButtons() {
                // Update button states based on current formatting
                boldBtn.classList.toggle('active', document.queryCommandState('bold'));
                italicBtn.classList.toggle('active', document.queryCommandState('italic'));
                underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
                
                // Check alignment
                const alignment = document.queryCommandValue('justifyLeft') ? 'left' : 
                                document.queryCommandValue('justifyCenter') ? 'center' :
                                document.queryCommandValue('justifyRight') ? 'right' : 'left';
                
                alignLeftBtn.classList.toggle('active', alignment === 'left');
                alignCenterBtn.classList.toggle('active', alignment === 'center');
                alignRightBtn.classList.toggle('active', alignment === 'right');
                
                // Check list types
                bulletListBtn.classList.toggle('active', document.queryCommandState('insertUnorderedList'));
                numberListBtn.classList.toggle('active', document.queryCommandState('insertOrderedList'));
            }
            
            // Event listeners for formatting buttons
            boldBtn.addEventListener('click', () => formatText('bold'));
            italicBtn.addEventListener('click', () => formatText('italic'));
            underlineBtn.addEventListener('click', () => formatText('underline'));
            alignLeftBtn.addEventListener('click', () => formatText('justifyLeft'));
            alignCenterBtn.addEventListener('click', () => formatText('justifyCenter'));
            alignRightBtn.addEventListener('click', () => formatText('justifyRight'));
            bulletListBtn.addEventListener('click', () => formatText('insertUnorderedList'));
            numberListBtn.addEventListener('click', () => formatText('insertOrderedList'));
            
            // Color picker
            colorPicker.addEventListener('input', function() {
                formatText('styleWithCSS', true);
                formatText('foreColor', this.value);
            });
            
            // Font family
            fontSelect.addEventListener('change', function() {
                formatText('fontName', this.value);
            });
            
            // Font size
            sizeSelect.addEventListener('change', function() {
                formatText('fontSize', this.value);
            });
            
            // Spellcheck toggle
            spellcheckToggle.addEventListener('click', function() {
                this.classList.toggle('active');
                editor.spellcheck = this.classList.contains('active');
            });
            
            // Save button
            saveBtn.addEventListener('click', function() {
                const content = editor.innerHTML;
                localStorage.setItem('editorContent', content);
                
                // Visual feedback
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="material-symbols-outlined">check</span> Saved!';
                this.style.backgroundColor = '#4CAF50';
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.backgroundColor = '#0C0C0C';
                }, 1500);
            });
            
            // Load saved content if available
            const savedContent = localStorage.getItem('editorContent');
            if (savedContent) {
                editor.innerHTML = savedContent;
            }
            
            // Update button states when selection changes
            document.addEventListener('selectionchange', updateActiveButtons);
            
            // Handle paste event to clean up formatting
            editor.addEventListener('paste', function(e) {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                document.execCommand('insertText', false, text);
            });
            
            // Set focus to editor
            editor.focus();
        });
