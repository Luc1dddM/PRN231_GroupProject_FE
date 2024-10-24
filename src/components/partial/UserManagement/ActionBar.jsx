import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Popover, Checkbox, Space, Tag, Row, Col, DatePicker,Input } from 'antd';
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { authorizedAxiosInstance } from "../../../utils/authorizedAxios";
import { API_GateWay } from "../../../utils/constants";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import Test from "../../../pages/Test";
import dayjs from 'dayjs';

const { Search } = Input;
const { RangePicker } = DatePicker;
const dateFormatDisplay = 'DD-MM-YYYY';
const dateFormatInRequest = 'YYYY-MM-DD';

//Define filters options in filters (id: checking, label: display in webisite, value: value pass in URL)
const filterOptions = {
  gender: [ 
    { id: "male", label: "Male", value: "Male" },
    { id: "female", label: "Female", value: "Female" },
    { id: "others", label: "Others", value: "Others" },
  ],
  status: [
    { id: "active", label: "Active", value: "true" },
    { id: "inactive", label: "In Active", value: "false" },
  ],
};
function ActionBar({ showModal }) {
  const [search, setSearch] = useSearchParams(); //searchParams hook

  // Get all filters from URL (if any)
  const statusValues = search.getAll("Statuses") ?? []; 

  const genderValues = search.getAll("Genders") ?? []; 

  const birthdayFromValue = search.get("BirthDayFrom")

  const birthdayToValue = search.get("BirthDayTo")

  const birthdayFromDayJs = birthdayFromValue ? dayjs(birthdayFromValue, dateFormatDisplay) : dayjs()

  const birthdayToDayJs  = birthdayToValue ? dayjs(birthdayToValue, dateFormatDisplay) : dayjs()

  //seletedFilters for after apply button
  const [selectedFilters, setSelectedFilters] = useState({
    gender: genderValues ?? [],
    status: statusValues ?? [],
    birthdayFrom: birthdayFromValue ?? null,
    birthdayTo: birthdayToValue ?? null,
  });

  //TempFilters for tmp user choose in the filter modal
  const [tempFilters, setTempFilters] = useState({
    gender: [],
    status: [],
    birthdayFrom: null,
    birthdayTo: null,
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

  //Handle Apply filters button click
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

  if (object.birthdayFrom) { 
    search.set("BirthDayFrom", object.birthdayFrom);    
  } else {
    search.delete("BirthDayFrom");
  }

  if (object.birthdayTo) { 
    search.set("BirthDayTo", object.birthdayTo);    
  } else {
    search.delete("BirthDayTo");
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
    
    //define what that will be removed
    let RemovedTemp = selectedFilters;

    if(filterType === "birthdayFrom" || filterType === "birthdayTo"){
      RemovedTemp = {
        ...selectedFilters,
        [filterType] : null
      }
    }else{
      RemovedTemp = {
        ...selectedFilters,
        [filterType]: selectedFilters[filterType].filter(
          (value) => value !== filterValue
        ),
      };
    }

    //Change query in URL before change in state
    handleChangeQuery(RemovedTemp);

    //Change filters in state to render in Browser
    setSelectedFilters(RemovedTemp);

    //*IMPORTANT*//
    /*Explaination for above code flow
      Why we dont setSelectedFilters before then use the SelectedFilters to pass to handleChangeQuery function?
      Because react use state hook when set a new value is asynchronous and there no await for this 
      so if pass the SelectedFilters to handleChangeQuery function there is nothing changed 
      TRY BY YOURSELF :))) 
    */

  };

  //Handle search keyword
  const handleSearch = (value) =>{
    value ? search.set("Keyword", value) : search.delete("Keyword")

    setSearch(search, { replace: true }); 
  }

  //Import User Handler to pass in popup modal
  const handleImportUser = async (formData) => {
    const res = await authorizedAxiosInstance.post(
        `${API_GateWay}/gateway/User/ImportUser`, 
          formData,
        {
          headers: {
              'Content-Type': 'multipart/form-data' // Specify the content type
          },
          responseType: "blob",
        }
      )

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

        toast.error("Please Check The Errors File")
    }else{
        toast.success("Import User Successfully")
    }
  }

  //Handle Birth day range change antd
  const handleChangeBirthDayRange = (values) =>{
    setTempFilters((prev) => ({
      ...prev,
      birthdayFrom: values[0] ? values[0].format(dateFormatInRequest): null,
      birthdayTo: values[1] ? values[1].format(dateFormatInRequest): null,
    }));
  }

  const handleExportUsers = async () =>{
    const res = await authorizedAxiosInstance.post(
      `${API_GateWay}/gateway/User/ExportUsers`, 
        {
          keyword: search.get("Keyword"),
          birthDayFrom: search.get("BirthDayFrom"),
          birthDayTo: search.get("BirthDayTo"),
          statuses: search.getAll("Statuses"),
          genders: search.getAll("Genders"),
          sortBy: search.get("SortBy"),
          sortOrder: search.get("SortOrder"),
        },
        {
          responseType: "blob",
        }
    )

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
        <RangePicker
          style={{ width: "100%" }}
          defaultValue={[birthdayFromDayJs, birthdayToDayJs]}
          format={dateFormatDisplay}
          onCalendarChange={(dates) => handleChangeBirthDayRange(dates)}
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
              >
                Add User
              </Button>
              <Test handleSubmit={handleImportUser}></Test>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleExportUsers}
              >
                Export Users
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
              if (filterType !== "birthdayFrom" && filterType !== "birthdayTo") {
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
              }else{
                if(selectedFilters[filterType]){
                  return(
                    <Tag
                      key={`${filterType}-${selectedFilters[filterType]}`}
                      closable
                      onClose={() => removeFilter(filterType, selectedFilters[filterType])}
                      style={{ marginRight: 3 }}
                    >
                      {
                        selectedFilters[filterType]
                      }
                    </Tag>
                );}}
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
