// Helper function to extract data from nested tables
function extractNestedTableData(nestedTable) {
  const values = new Set();
  nestedTable.querySelectorAll('td').forEach(td => {
    const text = td.textContent.trim();
    if (text) values.add(text);
  });
  return Array.from(values).join(', ');
}

function extractTableData(table) {
  const rows = table.querySelectorAll(':scope > tbody > tr, :scope > tr');
  let tableData = '';

  rows.forEach(row => {
    const cells = row.querySelectorAll(':scope > td');
    cells.forEach((cell, index) => {
      // Check if the first cell
      if (index === 0) {
        const cellText = cell.textContent.trim();
        tableData += `**${cellText}${cellText.endsWith(':') ? '' : ':'}** `;
      } else {
        // Handle nested tables
        const nestedTable = cell.querySelector('table');
        if (nestedTable) {
          tableData += extractNestedTableData(nestedTable);
        } else {
          // Special handling for 'Targeted Degrees and Disciplines'
          const cellText = cell.textContent;
          if (needsSpaceCleaning.has(cells[0].textContent.trim())) {
            tableData += cleanExtraSpace(cellText);
          } else if (needsLineChangeRemoval.has(cells[0].textContent.trim())) {
            tableData += removeLineBreaks(cellText);
          } else {
            tableData += cellText.trim();
          }
        }
      }
    });
    tableData += '\n\n';
  });
  return tableData;
}

const needsSpaceCleaning = new Set(['Targeted Degrees and Disciplines:']);
const needsLineChangeRemoval = new Set(['Application Deadline:']);

/**
 * Removes excessive whitespace and newlines from text.
 * This function performs the following cleanup:
 * 1. Removes multiple consecutive blank lines between text
 * 2. Removes extra spaces at the start of lines 
 * 3. Trims whitespace from beginning and end of text
 */
function cleanExtraSpace(text) {
  let cleaned = text.replace(/\n\s*\n+/g, '\n'); 
  cleaned = cleaned.replace(/\n\s+/g, '\n');
  return cleaned.trim();
}

/**
 * Removes all line breaks from text, replacing them with spaces.
 * Multiple consecutive line breaks are replaced with a single space.
 */
function removeLineBreaks(text) {
  return text.replace(/\s*\n\s*/g, '').trim();
}

// Function to extract data from all relevant tables in the posting
export function extractAllTablesData(postingDiv) {
  const tables = Array.from(postingDiv.querySelectorAll('.table-bordered'))
    .filter(table => !table.closest('.goose-glance-panel')); // Exclude tables in Goose Glance

  let fullDescription = '';

  tables.forEach((table, index) => {
    const panelHeading = table.closest('.panel')?.querySelector('.panel-heading');
    if (panelHeading) {
      fullDescription += `## ${panelHeading.textContent.trim()}\n\n`;
    }
    fullDescription += extractTableData(table) + '\n';
  });

  return fullDescription;
}
