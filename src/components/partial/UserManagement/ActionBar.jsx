import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Popover, Checkbox, Space, Tag, DatePicker } from "antd";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

//Define filters options in filters (id: checking, label: display in webisite, value: value pass in URL)
const filterOptions = {
  gender: [
    { id: "male", label: "Nam", value: "Male" },
    { id: "female", label: "Nữ", value: "Female" },
    { id: "others", label: "Khác", value: "Others" },
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
    gender: [],
    status: statusIds ?? [],
    birthday: null,
  });

  //TempFilter for tmp user choose in the filter modal
  const [tempFilters, setTempFilters] = useState({
    gender: [],
    status: [],
    birthday: null,
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
  if (object.gender.length > 0) { 
    search.delete("Genders");    
 
    object.gender.forEach((gender) => {
      search.append("Genders", gender);
    });
  } else {
    search.delete("Genders");
  }


    setSearch(search, { replace: true }); // Set all params in seach to url
  };

  //Handle reset button
  const handleReset = () => {
    setTempFilters({
      gender: [],
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
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].filter((id) => id !== filterValue),
    }));

    //*IMPORTANT*//
    /*Explaination for above code flow
      Why we dont setSelectedFilters before then use the SelectedFilters to pass to handleChangeQuery function?
      Because react use state hook when set a new value is asynchronous and there no await for this 
      so if pass the SelectedFilters to handleChangeQuery function there is nothing changed 
      TRY BY YOURSEFT :))) 
    */

  };


  //Filter modal content
  const filterContent = (
    <div style={{ width: 300 }}>
      <h4 style={{ marginBottom: 16 }}>Filter Options</h4>

      <div style={{ marginBottom: 16 }}>
        <h4>Giới tính</h4>
        <Checkbox.Group
          value={tempFilters.gender}
          onChange={(checkedValues) =>
            handleFilterChange("gender", checkedValues)
          }
        >
          {filterOptions.gender.map((option) => (
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

      <div style={{ marginBottom: 16 }}>
        <h4>Ngày sinh</h4>
        <DatePicker
          style={{ width: "100%" }}
          value={tempFilters.birthday}
          onChange={(date) => handleFilterChange("birthday", date)}
        />
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
    <div
      style={{
        padding: 16,
        borderBottom: "1px solid #f0f0f0",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>Action Bar</h2>
        <Space>
          <Space style={{ flexDirection: "row-reverse" }}>
            {/* Display selected filters with tags */}
            {Object.keys(selectedFilters).map((filterType) => {
              // Ensure selectedFilters[filterType] is an array and filterType is not 'birthday'
              if (filterType !== "birthday") {
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
              }
              return null; // Return null for 'birthday' filterType
            })}
          </Space>
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
            <Button icon={<FilterOutlined />}>Filter</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              className="mb-4"
              style={{ backgroundColor: "#1890ff", marginLeft: "16px" }}
            >
              Add Template
            </Button>
          </Popover>
        </Space>
      </div>
    </div>
  );
}

ActionBar.propTypes = {
  showModal: PropTypes.func.isRequired,
};

export default ActionBar;
