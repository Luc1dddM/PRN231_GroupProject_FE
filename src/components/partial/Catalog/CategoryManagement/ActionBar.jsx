import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {Button, Popover, Checkbox, Space, Tag, Row, Col, DatePicker,Input } from "antd";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { authorizedAxiosInstance } from "../../../../utils/authorizedAxios";
import { API_GateWay } from "../../../../utils/constants";


const { Search } = Input;
//Define filters options in filters (id: checking, label: display in webisite, value: value pass in URL)
const filterOptions = {
  type: [
    { id: "brand", label: "Brand", value: "Brand" },
    { id: "device", label: "Device", value: "Device" },
    { id: "color", label: "Color", value: "Color" },
  ],
  status: [
    { id: "active", label: "Active", value: "true" },
    { id: "inactive", label: "In Active", value: "false" },
  ],
};
function ActionBar({ showModal }) {
  const [search, setSearch] = useSearchParams(); //searchParams hook

  const statusValues = search.getAll("Statuses") ?? []; // Get array of statuses from URL (if any)

  //Change statusValues to statusIds to assign in state (render by id not by value)
  const statusIds = filterOptions.status
    .filter((option) => statusValues.includes(option.value))
    .map((option) => option.id);

  //seletedFilters for after apply button
  const [selectedFilters, setSelectedFilters] = useState({
    type: [],
    status: statusIds ?? [],
  });

  //TempFilter for tmp user choose in the filter modal
  const [tempFilters, setTempFilters] = useState({
    type: [],
    status: [],
  });

  //Status modal (open/close)
  const [popoverVisible, setPopoverVisible] = useState(false);

  // Handle filter change per category
  const handleFilterChange = (filterType, checkedValues) => {
    setTempFilters((prev) => ({
      ...prev,
      [filterType]: checkedValues,
    }));
  };

  //Handle Apply button click
  const handleSave = () => {
    setSelectedFilters(tempFilters); // set temp filters to selected filters
    handleChangeQuery(tempFilters); // set filters to URL to fetch API
    setPopoverVisible(false); // close popup
  };

  //Set Status to params
  const handleChangeQuery = (object) => {
    if (object.status.length > 0) { // check if fitler options exist
      search.delete("Statuses");    // Clear previous Statuses
      //for each status to append into the url (using object.status.join() make url encrypt)
      object.status.forEach((status) => {
        search.append("Statuses", status);
      });
    } else { // no filter option in array => not filer status any more
      search.delete("Statuses");
    }


  //The same with above but for Gender
  if (object.type.length > 0) { 
    search.delete("Type");    
 
    object.type.forEach((type) => {
      search.append("Type", type);
    });
  } else {
    search.delete("Type");
  }


    setSearch(search, { replace: true }); // Set all params in seach to url
  };

  //Handle reset button
  const handleReset = () => {
    setTempFilters({
      type: [],
      status: [],
    });
  };


  //Remove filters by click close button in filter tag
  const removeFilter = (filterType, filterValue) => {
    //define what what will be removed
    const RemovedTemp = {
      ...selectedFilters,
      [filterType]: selectedFilters[filterType].filter(
        (value) => value !== filterValue
      ),
    };

    //Change query in URL before change in state
    handleChangeQuery(RemovedTemp);

    //Change filters in state to render in Browser
    setSelectedFilters(RemovedTemp);


  
    //*IMPORTANT*//
    /*Explaination for above code flow
      Why we dont setSelectedFilters before then use the SelectedFilters to pass to handleChangeQuery function?
      Because react use state hook when set a new value is asynchronous and there no await for this 
      so if pass the SelectedFilters to handleChangeQuery function there is nothing changed 
      TRY BY YOURSEFT :))) 
    */

  };

  const handleSearch = (value) =>{
    value ? search.set("Keyword", value) : search.delete("Keyword")

    setSearch(search, { replace: true }); 
  }


  const handleExportCategories = async () =>{
    const res = await authorizedAxiosInstance.post(
      `${API_GateWay}/gateway/Categories/ExportCategories`, 
      {
        parameters: {
          keyword: search.get("Keyword"),
          statuses: search.getAll("Statuses"),
          types: search.getAll("Type"),
          sortBy: search.get("SortBy"),
          sortOrder: search.get("SortOrder"),
        }
      },
        {
          responseType: "blob",
        }
    )
console.log(res.data.size)
  if(res.data.size > 0){
        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const outputFilename = `${Date.now()}.xlsx`;
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.setAttribute("download", outputFilename);
          // the filename you want
          document.body.appendChild(a);
          a.click();
    }
  }


  //Filter modal content
  const filterContent = (
    <div style={{ width: 300 }}>
      <h4 style={{ marginBottom: 16 }}>Filter Options</h4>

      <div style={{ marginBottom: 16 }}>
        <h4>Loại Phân Loại</h4>
        <Checkbox.Group
          value={tempFilters.type}
          onChange={(checkedValues) =>
            handleFilterChange("type", checkedValues)
          }
        >
          {filterOptions.type.map((option) => (
            <Checkbox key={option.id} value={option.value}>
              {option.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4>Trạng thái</h4>
        <Checkbox.Group
          value={tempFilters.status}
          onChange={(checkedValues) =>
            handleFilterChange("status", checkedValues)
          }
        >
          {filterOptions.status.map((option) => (
            <Checkbox key={option.id} value={option.value}>
              {option.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
        <Button size="small" type="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
      <Row gutter={24} align="middle">
        <Col flex="none">
          <h2 style={{ margin: 0, whiteSpace: 'nowrap' }}>Action Bar</h2>
        </Col>
        <Col flex="auto">
          <Space size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Search
              placeholder="Search..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Space size="small" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Popover
                content={filterContent}
                title="Filters"
                trigger="click"
                visible={popoverVisible}
                onVisibleChange={(visible) => {
                  setPopoverVisible(visible);
                  if (visible) {
                    setTempFilters(selectedFilters);
                  }
                }}
              >
                <Button icon={<FilterOutlined />}>
                  Filter
                </Button>
              </Popover>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
                style={{ backgroundColor: "#1890ff" }}
              >
                Add
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleExportCategories}
              >
                Export Category
              </Button>
            </Space>
          </Space>
        </Col>
      </Row>
      
      </div>
      {Object.keys(selectedFilters).length > 0 && (
        <div style={{ padding: '8px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <Row justify="end">
            <Col>
              <Space size="small" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {Object.keys(selectedFilters).map((filterType) => {
              // Ensure selectedFilters[filterType] is an array and filterType is not 'birthday'           
                return (selectedFilters[filterType] || []).map((value) => (
                    <Tag
                      key={`${filterType}-${value}`}
                      closable
                      onClose={() => removeFilter(filterType, value)}
                      style={{ marginRight: 3 }}
                    >
                      {
                        filterOptions[filterType].find(
                          (option) => option.value === value
                        )?.label
                      }
                    </Tag>
                ));
            })}
              </Space>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}

ActionBar.propTypes = {
  showModal: PropTypes.func.isRequired,
};

export default ActionBar;
