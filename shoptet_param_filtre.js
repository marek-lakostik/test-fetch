<script>
async function fetchCategories() {
  const url = "https://716259.myshoptet.com/export/categories.xml?partnerId=5&patternId=-31&hash=b6027ce300bbad15222208ce1b2b3eaa5698eecb375d1f4fa70a7570b0d4d9de";

  try {
    const response = await fetch(url);
    const xmlText = await response.text();

    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Extract categories
    const categoryElements = xmlDoc.getElementsByTagName("CATEGORY");
    const categories = [];

    for (let i = 0; i < categoryElements.length; i++) {
      const category = categoryElements[i];
      categories.push({
        id: getElementText(category, "ID"),
        guid: getElementText(category, "GUID"),
        parentId: getElementText(category, "PARENT_ID"),
        title: getElementText(category, "TITLE"),
        indexName: getElementText(category, "INDEX_NAME"),
        visible: getElementText(category, "VISIBLE") === "1"
      });
    }

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

// Helper function to extract text from XML elements
function getElementText(parent, tagName) {
  const element = parent.getElementsByTagName(tagName)[0];
  return element ? element.textContent || "" : "";
}

// Create and manage the cascading selects
async function setupCascadingSelects() {

    const isRootDomain = window.location.pathname === "/" || 
                       window.location.pathname === "/index.html" ||
                       window.location.pathname === "";
  
  // Only create and display selects on root domain
  if (!isRootDomain) {
    return;
  }

  // Create the select elements dynamically
    const container = document.getElementById('header');
  
  // Apply flex layout
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '15px';
  container.style.padding = '15px';
  container.style.backgroundColor = '#f5f5f5';
  container.style.borderRadius = '5px';
  container.style.flexWrap = 'wrap';
  
  // Create select elements
  const select1 = document.createElement('select');
  const select2 = document.createElement('select');
  const select3 = document.createElement('select');
  
  // Set IDs for the selects
  select1.id = 'select1';
  select2.id = 'select2';
  select3.id = 'select3';
  
  // Apply styling to select elements
  const selectStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    minWidth: '180px'
  };
  
  Object.assign(select1.style, selectStyle);
  Object.assign(select2.style, selectStyle);
  Object.assign(select3.style, selectStyle);
  
  // Create wrapping divs for each select with labels
  const div1 = document.createElement('div');
  const div2 = document.createElement('div');
  const div3 = document.createElement('div');
  
  // Create labels
  const label1 = document.createElement('label');
  const label2 = document.createElement('label');
  const label3 = document.createElement('label');
  
  label1.textContent = 'Level 1: ';
  label2.textContent = 'Level 2: ';
  label3.textContent = 'Level 3: ';
  
  // Style the label containers
  [div1, div2, div3].forEach(div => {
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.gap = '5px';
  });
  
  // Add elements to their containers
  div1.appendChild(label1);
  div1.appendChild(select1);
  
  div2.appendChild(label2);
  div2.appendChild(select2);
  
  div3.appendChild(label3);
  div3.appendChild(select3);
  
  // Add select containers to main container
  container.appendChild(div1);
  container.appendChild(div2);
  container.appendChild(div3);
  
  // Create search button
  const searchButton = document.createElement('button');
  searchButton.textContent = 'Search';
  searchButton.id = 'searchButton';
  
  // Style the button
  searchButton.style.padding = '10px 20px';
  searchButton.style.backgroundColor = '#4CAF50';
  searchButton.style.color = 'white';
  searchButton.style.border = 'none';
  searchButton.style.borderRadius = '4px';
  searchButton.style.cursor = 'pointer';
  searchButton.style.alignSelf = 'flex-end';
  searchButton.style.marginTop = '19px';
  
  // Add button to container
  container.appendChild(searchButton);
  
  // Fetch and process the categories
  const categories = await fetchCategories();

  // Create group by parentId for quick lookup
  const categoryByParent = {};

  categories.forEach(category => {
    if (!categoryByParent[category.parentId]) {
      categoryByParent[category.parentId] = [];
    }
    categoryByParent[category.parentId].push(category);
  });

  // Create a lookup map for categories
  const categoryById = {};

  // Populate the lookup map
  categories.forEach(category => {
    categoryById[category.id] = category;
  });

  // Populate first select with categories where parentId = 1
  populateSelect(select1, categoryByParent['1'] || []);

  // Event handlers for cascading updates
  select1.addEventListener('change', () => {
    const selectedCategoryId = select1.value;
    populateSelect(select2, categoryByParent[selectedCategoryId] || []);
    // Clear the third select when first select changes
    clearSelect(select3);
  });

  select2.addEventListener('change', () => {
    const selectedCategoryId = select2.value;
    populateSelect(select3, categoryByParent[selectedCategoryId] || []);
  });

  searchButton.addEventListener('click', () => {
        // Get the currently selected values from each select
    const selectedId1 = select1.value;
    const selectedId2 = select2.value;  
    const selectedId3 = select3.value;

    // Determine which is the highest level with a selection
    let indexName = null;
    
    if (selectedId3) {
      // Level 3 is selected, use its index_name
      indexName = categoryById[selectedId3]?.indexName;
    } else if (selectedId2) {
      // Level 2 is selected, use its index_name
      indexName = categoryById[selectedId2]?.indexName;
    } else if (selectedId1) {
      // Only level 1 is selected, use its index_name
      indexName = categoryById[selectedId1]?.indexName;
    }

    // Redirect if we found a valid indexName
    if (indexName) {
      // Get base domain without path
      const domain = window.location.protocol + '//' + window.location.host;
      
      // Redirect to domain/index_name
      window.location.href = domain + '/' + indexName;
    } else {
      console.log('No valid category selected');
    }
    // window.location.href = "/oblecenie";
  })
}

function populateSelect(selectElement, categories) {
  // Clear existing options
  clearSelect(selectElement);

  console.log('populate select', categories);

  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Select --';
  selectElement.appendChild(defaultOption);

  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.title;
    selectElement.appendChild(option);
  });
}

// Helper function to clear a select element
function clearSelect(selectElement) {
  selectElement.innerHTML = '';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', setupCascadingSelects);

</script>