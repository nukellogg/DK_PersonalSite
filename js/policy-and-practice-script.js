$(document).ready(function() {
    // Global variables
    var policyTables = {}; // store Tabulator instances by section

    // Map of valid sections (matches input values and ids in HTML)
    var validSections = [
        'opeds-blogs',
        'media-podcasts',
        'usaid-outputs',
        'systematic-reviews',
        'links-of-interest'
    ];

    // Utility: hide all section spinners and tables
    function hideAllSections() {
        validSections.forEach(function(s) {
            $('#loading-' + s).hide();
            $('#' + s + '-table').hide();
        });
    }

    // Function to load data for the selected section type
    function loadPolicyData(sectionType) {
        if (!validSections.includes(sectionType)) return;

        // Hide everything then show the spinner for this section
        hideAllSections();
        $('#loading-' + sectionType).show();

        // Build JSONP callback name so server can call a section-specific handler
        var callbackName = 'handlePolicyData_' + sectionType.replace(/-/g, '_');

        // Ensure the window callback exists and delegates to a single handler
        window[callbackName] = function(results) {
            // pass results along with section name
            handlePolicyData(results, sectionType);

            // cleanup: remove this global callback after use
            try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }

            // remove dynamically inserted script tag
            var tagId = 'policy-data-load-script-' + sectionType;
            var existingScript = document.getElementById(tagId);
            if (existingScript) existingScript.remove();
        };

        // Build dynamic script URL (Google Apps Script should echo a JS callback invocation using the provided prefix param)
        var scriptBase = 'https://script.google.com/macros/s/AKfycbz2-MvSBcIm9b5bCaU_dpjrG54ZBcA-qPuGIwKbvBMUgAVtEK2axn_sX-iqUwVyTieEww/exec';
        var scriptUrl = scriptBase + '?prefix=' + encodeURIComponent(callbackName) + '&type=' + encodeURIComponent(sectionType);

        // Remove any previous script for this section
        var prev = document.getElementById('policy-data-load-script-' + sectionType);
        if (prev) prev.remove();

        // Create dynamic script element to load data
        var scriptElement = document.createElement('script');
        scriptElement.src = scriptUrl;
        scriptElement.id = 'policy-data-load-script-' + sectionType;
        document.body.appendChild(scriptElement);
    }

    // Function to handle the data once received from the server for a specific section
    function handlePolicyData(results, sectionType) {
        // Hide spinner and show the table container for this section
        $('#loading-' + sectionType).hide();
        $('#' + sectionType + '-table').show();

        // Destroy existing table for this section if present
        if (policyTables[sectionType]) {
            try { policyTables[sectionType].destroy(); } catch (e) {}
            policyTables[sectionType] = null;
        }

        // Create new Tabulator instance for the section-specific table element
        var tableEl = document.getElementById(sectionType + '-table');
        policyTables[sectionType] = new Tabulator(tableEl, {
            data: results,
            selectable: false,
            initialSort: [ {column: 'date', dir: 'desc'} ],
            layout: 'fitDataTable',
            layoutColumnsOnNewData: true,
            height: 'auto',
            autoResize: false,
            resizableRows: true,
            resizableColumns: false,
            responsiveLayout: false,
            movableColumns: false,
            columns: [
                {title: 'Title', field: 'title', width: '50%', headerFilter: 'input', variableHeight: true,
                    formatter: function(cell) {
                        var value = cell.getValue() || '';
                        var url = cell.getRow().getData().url || '#';
                        return '<a href="' + url + '" target="_blank" class="tabulator-link" rel="noopener noreferrer">' + value + '</a>';
                    },
                    headerFilterPlaceholder: 'Search by Title',
                    headerSort: false
                },
                {title: 'Date', field: 'date', width: '7%', headerSort: false,
                    formatter: function(cell) {
                        var value = cell.getValue();
                        if (value) {
                            value = moment.utc(Date.parse(value)).format('MM/YYYY');
                        }
                        return value || '';
                    }
                },
                {title: 'Publication', field: 'publication', width: '23%', headerSort: false, headerFilter: 'input', headerFilterPlaceholder: 'Search by Publication', variableHeight: true,
                    formatter: function(cell) {
                        var value = cell.getValue() || '';
                        return '<div class="publication-cell">' + value + '</div>';
                    }
                },
                {title: 'Co-Authors', field: 'authors', width: '20%', headerSort: false, headerFilter: 'input', headerFilterPlaceholder: 'Search by Co-Authors', variableHeight: true,
                    formatter: function(cell) {
                        var value = cell.getValue() || '';
                        return '<div class="authors-cell">' + value + '</div>';
                    }
                }
            ],
            rowFormatter: function(row) {
                row.getElement().style.height = 'auto';
                row.getElement().style.minHeight = '48px';
                row.getCells().forEach(function(cell) {
                    cell.getElement().style.height = 'auto';
                    cell.getElement().style.maxHeight = 'none';
                    cell.getElement().style.overflow = 'visible';
                    cell.getElement().style.whiteSpace = 'normal';
                    cell.getElement().style.wordBreak = 'break-word';
                });
                row.normalizeHeight();
            },
            renderComplete: function() {
                var tbl = policyTables[sectionType];
                if (tbl) {
                    setTimeout(function() { tbl.redraw(true); }, 100);
                }
            }
        });
    }

    // For backward compatibility - in case the server calls handlePolicyData(results)
    window.handlePolicyData = function(results) {
        // default to first valid section if no section specified
        handlePolicyData(results, validSections[0]);
    };

    // Initial load: use checked radio
    var initial = $('input[name="section-type"]:checked').val();
    if (initial) loadPolicyData(initial);

    // Handle section type change
    $('input[name="section-type"]').change(function() {
        var section = $(this).val();
        loadPolicyData(section);
    });

    // Reset button: clears filters on the currently visible section table
    $("#resetBtn").click(function() {
        var visibleSection = validSections.find(function(s) { return $('#' + s + '-table').is(':visible'); });
        if (visibleSection && policyTables[visibleSection]) {
            policyTables[visibleSection].clearFilter(true);
        }
    });
});
