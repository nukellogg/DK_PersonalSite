// Format date for display
// Global variables
var publicationsTable;
var global_prev_vals = {};

// Counter update function
async function updateCounter(counter, val=null) {
    if(!(counter in global_prev_vals) || val === null || (global_prev_vals[counter] != val) && (val.length > 0) && (val !== "ALL")){
        global_prev_vals[counter] = val;
        await fetch(`https://script.google.com/macros/s/AKfycbwhVgwFUDnTsWmLkoEj-WyW_eOFTUF0ibJwNhXdCMZIT6bczSc--_MAof_0EpAIvwzqtQ/exec?action=incrementCounter&counter=${counter}`);
    }
}

var dateFormatter = function (cell, formatterParams) {
    var value = cell.getValue();
    if (value) {
        value = moment.utc(Date.parse(value)).format("MM/YYYY");
    }
    return value;
};

var publicationsTable;

// Function to load data for the selected publication type
function loadPublicationsData(paperType) {
    // Show loading indicator
    $('#loading-container').show();
    $('#academic-papers-table').hide();
    
    // Use the working script URL from the old file
    const scriptUrl = `https://script.google.com/macros/s/AKfycbz2-MvSBcIm9b5bCaU_dpjrG54ZBcA-qPuGIwKbvBMUgAVtEK2axn_sX-iqUwVyTieEww/exec?prefix=handleData&type=${paperType}`;
    
    // Remove any existing script elements
    const existingScript = document.getElementById('data-load-script');
    if (existingScript) {
        existingScript.remove();
    }
    
    // Create dynamic script element to load data
    const scriptElement = document.createElement('script');
    scriptElement.src = scriptUrl;
    scriptElement.id = 'data-load-script';
    
    // Add new script element to the document
    document.body.appendChild(scriptElement);
}

// Function to handle title filtering
function titleFunction(headerValue, rowValue, rowData, filterParams) {
    var searchStrings = headerValue.split(" ");
    var stringPresent = false;

    $.each(searchStrings, function (j, searchString) {
        if (rowData.title.toLowerCase().includes(searchString.toLowerCase())) {
            stringPresent = true;
        } else {
            stringPresent = false;
            return false;
        }
    });
    return stringPresent;
}

// Function to handle the data once received from the server
function handleData(results) {
    // Hide loading indicator
    $('#loading-container').hide();
    $('#academic-papers-table').show();
    
    // If table already exists, destroy it to recreate
    if (publicationsTable) {
        publicationsTable.destroy();
    }
    
    // Create new table with the data
    publicationsTable = new Tabulator("#academic-papers-table", {
        data: results,
        selectable: false,
        rowClick: function(e, row) {
            // Check if the click was on a link
            if (e.target.tagName === 'A' || e.target.parentElement.tagName === 'A') {
                e.stopPropagation(); // Stop event from triggering row click
                return false; // Prevent default row click action
            }
        },
        initialSort: [
            {column: "date", dir: "desc"}
        ],
        layout: "fitDataTable", // Changed to fitDataTable for better fixed width handling
        layoutColumnsOnNewData: true,
        height: "auto",
        autoResize: false, // Disable auto resize to keep fixed widths
        resizableRows: true, 
        resizableColumns: false,
        responsiveLayout: false,
        movableColumns: false,
        columns: [
            {title: "Citation Count", field: "citation", visible: false, headerSort: false},
            {title: "Citation/Year", field: "citationYear", visible: false, headerSort: false},
            {title: "Category", field: "category", visible: false, headerSort: false},
            {title: "Type", field: "type", visible: false, headerSort: false},
            {title: "Country", field: "country", visible: false, headerSort: false},
            {
                title: "Title",
                field: "title",
                width: "50%", // Fixed width instead of percentage
                headerFilter: "input",
                variableHeight: true,
                formatter: function(cell, formatterParams, onRendered) {
                    // Get cell values
                    var value = cell.getValue() || "";
                    var url = cell.getRow().getData().url || "#";
                    
                    // Create cell content with tooltip
                    var cellEl = document.createElement("div");
                    cellEl.className = "title-cell";
                    
                    // Create link element
                    var linkEl = document.createElement("a");
                    linkEl.href = url;
                    linkEl.target = "_blank";
                    linkEl.rel = "noopener noreferrer";
                    linkEl.textContent = value;
                    linkEl.style.wordBreak = "break-word";
                    linkEl.style.whiteSpace = "normal";
                    
                    // Add explicit click handler to ensure link works
                    linkEl.addEventListener('click', function(e) {
                        e.stopPropagation(); // Stop event from bubbling up to parent elements
                        window.open(url, '_blank'); // Explicitly open link in new tab
                        return false; // Prevent default action
                    });
                    
                    // Add elements to cell
                    cellEl.appendChild(linkEl);
                    // cellEl.appendChild(tooltipEl);
                    
                    
                    
                    return cellEl;
                },
                headerFilterFunc: titleFunction,
                headerFilterPlaceholder: "Search by Title",
                headerSort: false
            },
            {
                title: "Date",
                field: "date", 
                width: "7%", // Fixed width
                formatter: function(cell, formatterParams, onRendered) {
                    var value = cell.getValue();
                    if (value) {
                        value = moment.utc(Date.parse(value)).format("MM/YYYY");
                    }
                    var element = document.createElement("div");
                    element.className = "tabulator-cell-wrapper";
                    element.textContent = value || "";
                    
                    
                    
                    return element;
                },
                headerSort: false
            },
            {
                title: "Publication",
                field: "publication",
                width: "23%", // Fixed width
                formatter: function(cell, formatterParams, onRendered) {
                    var value = cell.getValue() || "";
                    var element = document.createElement("div");
                    element.className = "publication-cell";
                    element.innerHTML = value;
                    element.style.wordBreak = "break-word";
                    element.style.whiteSpace = "normal";
                    
                    
                    
                    return element;
                },
                headerSort: false,
                headerFilter: "input",
                headerFilterPlaceholder: "Search by Publication",
                variableHeight: true
            },
            {
                title: "Co-Authors",
                field: "authors",
                width: "20%", // Fixed width
                formatter: function(cell, formatterParams, onRendered) {
                    var value = cell.getValue() || "";
                    var element = document.createElement("div");
                    element.className = "authors-cell";
                    element.textContent = value;
                    element.style.wordBreak = "break-word";
                    element.style.whiteSpace = "normal";
                    
                    
                    return element;
                },
                headerSort: false,
                headerFilter: "input",
                headerFilterPlaceholder: "Search by Co-Authors",
                variableHeight: true
            }
        ],
        rowFormatter: function(row) {
            // Force auto height
            row.getElement().style.height = "auto";
            row.getElement().style.minHeight = "48px";
            
            // Set all cells to auto height
            row.getCells().forEach(function(cell) {
                cell.getElement().style.height = "auto";
                cell.getElement().style.overflow = "visible";
                cell.getElement().style.whiteSpace = "normal";
                cell.getElement().style.wordBreak = "break-word";
            });
            
            // Force height recalculation
            row.normalizeHeight();
        },
        dataFiltered: function (filters, rows) {
            // Update paper count display
            var div = document.getElementById('academic-papers-table-info');
            div.innerHTML = '<span class="paper-count">' + rows.length + '</span> articles match your search criteria';
            
            // Force redraw to adjust heights after filtering
            setTimeout(function() {
                publicationsTable.redraw(true);
                publicationsTable.rowManager.normalizeHeight();
            }, 100);
        },
        renderComplete: function() {
            // // Force table to recalculate heights after all rows are rendered
            // this.rowManager.normalizeHeight();
            
            // Set an additional timeout to ensure heights are properly set
            // setTimeout(() => {
            //     this.rowManager.normalizeHeight();
            //     this.redraw(true);
            //     applyTableFixes(); // Apply fixes immediately after rendering
            // }, 100);
            setTimeout(() => {
                publicationsTable.rowManager.normalizeHeight();
                applyTableFixes();
            }, 100);
        }
    });
    
    // Apply any existing filters
    updateFilters();
    
    // Force a redraw after a brief delay to ensure proper rendering
    setTimeout(function() {
        publicationsTable.redraw(true);
        applyTableFixes(); // Apply fixes after redraw
    }, 200);
}

// Function to apply additional tweaks after table is created
function applyTableFixes() {
    if (!publicationsTable) return;
    
    // Fix cell heights and overflow in the DOM directly
    document.querySelectorAll('.tabulator-cell').forEach(function(cell) {
        cell.style.height = 'auto';
        cell.style.maxHeight = 'none';
        cell.style.overflow = 'visible';
        cell.style.whiteSpace = 'normal';
        cell.style.wordBreak = 'break-word';
        
        // Also apply to any child elements
        var children = cell.querySelectorAll('*');
        children.forEach(function(child) {
            child.style.whiteSpace = 'normal';
            child.style.wordBreak = 'break-word';
            child.style.overflowWrap = 'break-word';
        });
    });
    
    // Force table to recalculate row heights
    publicationsTable.rowManager.normalizeHeight();
    publicationsTable.redraw(true);
}


// Function to apply all filters
function updateFilters() {
    if (publicationsTable) {
        // Clear existing filters
        publicationsTable.clearFilter();
        
        // Apply category filter if selected
        if ($("#category-field").val()) {
            publicationsTable.addFilter(function(data) {
                return data.category && data.category.toLowerCase().includes($("#category-field").val().toLowerCase());
            });
        }
        
        // Apply country filter if selected
        if ($("#country-field").val()) {
            publicationsTable.addFilter(function(data) {
                return data.country && data.country.toLowerCase().includes($("#country-field").val().toLowerCase());
            });
        }
        
        // Apply sort
        publicationsTable.setSort($("#sort-field").val(), 'desc');
    }
}

// Custom filter functions
function customFilter(data) {
    return data.category.toLowerCase().includes($("#category-field").val().toLowerCase());
}

function updateCategoryFilter() {
    var filter = customFilter;
    publicationsTable.addFilter(filter, $("#category-field").val());
}

function customFilterCountry(data) {
    return data.country.toLowerCase().includes($("#country-field").val().toLowerCase());
}

function updateCountryFilter() {
    var filter = customFilterCountry;
    publicationsTable.addFilter(filter, $("#country-field").val());
}

// Initialize when document is ready
$(document).ready(function() {
    // Initial data load
    loadPublicationsData($('input[name="paper-type"]:checked').val());
    
    // Handle paper type change
    $('input[name="paper-type"]').change(function() {
        const paperType = $(this).val();
        updateCounter('type_counter', paperType);
        loadPublicationsData(paperType);
    });
    
    // Handle sort field change
    $("#sort-field").change(function() {
        if (publicationsTable) {
            publicationsTable.setSort($("#sort-field").val(), 'desc');
        }
    });
    
    // Handle category filter change
    $("#category-field").change(function() {
        updateCategoryFilter();
    });
    
    // Handle country filter change
    $("#country-field").change(function() {
        updateCountryFilter();
    });
    
    // Handle reset button
    $("#resetBtn").click(function() {
        if (publicationsTable) {
            publicationsTable.clearHeaderFilter();
        }
        $("#category-field").val('');
        $("#country-field").val('');
        $("#sort-field").val('date');
        updateFilters();
    });
    

    // Handle window resize for responsive design
    $(window).resize(_.debounce(function() {
        if (publicationsTable) {
            publicationsTable.redraw(true);
            
            // Force recalculation of row heights
            setTimeout(function() {
                publicationsTable.rowManager.normalizeHeight();
                applyTableFixes();
            }, 200);
        }
    }));
    
    // Track search field inputs
    $(document).on("input", "[tabulator-field='title'] > .tabulator-col-content > div > input", _.debounce(function(e) {
        updateCounter("title_counter", e.target.value);
        // Force height recalculation after filtering
        setTimeout(function() {
            if (publicationsTable) {
                publicationsTable.rowManager.normalizeHeight();
                applyTableFixes(); // Apply fixes after filtering
            }
        }, 300);
    }, 1500));
    
    $(document).on("input", "[tabulator-field='publication'] > .tabulator-col-content > div > input", _.debounce(function(e) {
        updateCounter("publication_counter", e.target.value);
        // Force height recalculation after filtering
        setTimeout(function() {
            if (publicationsTable) {
                publicationsTable.rowManager.normalizeHeight();
                applyTableFixes(); // Apply fixes after filtering
            }
        }, 300);
    }, 1500));
    
    $(document).on("input", "[tabulator-field='authors'] > .tabulator-col-content > div > input", _.debounce(function(e) {
        updateCounter("coauth_counter", e.target.value);
        // Force height recalculation after filtering
        setTimeout(function() {
            if (publicationsTable) {
                publicationsTable.rowManager.normalizeHeight();
                applyTableFixes(); // Apply fixes after filtering
            }
        }, 300);
    }, 1500));

    document.querySelectorAll('#academic-papers-table').forEach(function(element) {
        element.addEventListener('click', function(e) {
            console.log('Table click event target:', e.target);
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                console.log('Link clicked');
            }
        }, true); // Use capture phase
    });
});

// For backward compatibility - in case the script calls display
function display(results) {
    handleData(results);
}

// MutationObserver to ensure cells display properly after DOM changes
document.addEventListener("DOMContentLoaded", function() {
    // Create an observer to watch for changes in the table
    var observer = new MutationObserver(function(mutations) {
        if (publicationsTable) {
            // Force the table to recalculate heights
            setTimeout(function() {
                publicationsTable.rowManager.normalizeHeight();
            }, 100);
        }
    });
    
    // Start observing the table container for DOM changes
    var targetNode = document.getElementById('academic-papers-table');
    if (targetNode) {
        observer.observe(targetNode, { childList: true, subtree: true });
    }
});