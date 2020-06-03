import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  EuiFieldText,
  EuiCheckbox,
  EuiComboBox,
  EuiSuperSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiPage,
  EuiPageHeader,
  EuiTitle,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeaderSection,
  EuiInMemoryTable,
  EuiHorizontalRule,
  EuiSpacer,
  EuiSearchBar,
  EuiLink,
  EuiText,
  EuiEmptyPrompt
} from '@elastic/eui';
import { CreateReport } from './create_report';
import {reports_list_columns, reports_list_users, reports_list_search, reports_list_selection_value} from './reports_table'
import {scheduled_report_columns, scheduled_reports} from './scheduled_reports_table'
import { Fragment } from 'react';

var httpClientGlobal;

function fetchDownloadApi(url) {
    console.log("fetch download api")
    var data = {
      url: url
    }
     httpClientGlobal.post('../api/reporting/download', JSON.stringify(data)).then((resp) => {
      console.log(resp)
    });
}

function getDashboardList(data) {
  var hits = data.hits["hits"];
  var dashboardList = new Array(hits.length);
  for (var i = 0; i < hits.length; ++i) {
    var dashboardDict = {};
    dashboardDict["name"] = hits[i]["_source"]["dashboard"]["title"];
    dashboardDict["id"] = hits[i]["_id"];
    dashboardDict["id"] = dashboardDict["id"].replace("dashboard:", "");
    dashboardList[i] = dashboardDict;
  }
  return dashboardList;
}

const emptyMessageReports = (
  <EuiEmptyPrompt
    title={<h3>You Have No Reports</h3>}
    titleSize="xs"
    body="Create a report from a dashboard or template"
    actions={
      <EuiButton fill>Create Report</EuiButton>
    }
  />
)

const emptyMessageTemplatesEui = (
  <EuiEmptyPrompt
    title={<h3>You Have No Templates</h3>}
    titleSize="xs"
    body="Create a new teplate to get started"
    actions={
      <EuiButton fill>Create Template</EuiButton>
    }
  />
)

const emptyMessageTemplates = (
  <div>
    <h3>You Have No Templates</h3>
    <p>
      Create a new template to get started
    </p>
    <EuiButton fill>Create Template</EuiButton>
  </div>
)

const source_options = [
  {
    value: 'option_one',
    inputDisplay: 'Dashboard',
    'data-test-subj': 'option one',
  },
  {
    value: 'option_two',
    inputDisplay: 'Saved Search',
  },
  {
    value: 'option_three',
    inputDisplay: "Visualization",
  },
];

const schedule_delivery_recipient_options = [
  {
    label: 'davidcui@amazon.com'
  },
  {
    label: 'jadhanir@amazon.com'
  },
  {
    label: 'kvngar@amazon.com'
  },
  {
    label: 'anextremelyverylongemailaddress@amazon.com'
  }
];

// const [selectedOptions, setSelected] = useState([schedule_delivery_recipient_options[2], schedule_delivery_recipient_options[4]]);

// const onChangeDeliveryRecipients = selectedOptions => {
//   setSelected(selectedOptions);
// };

// const onCreateOption = (searchValue, flattenedOptions = []) => {
//   const normalizedSearchValue = searchValue.trim().toLowerCase();

//   if (!normalizedSearchValue) {
//     return;
//   }

//   const newOption = {
//     label: searchValue,
//   };

//   // Create the option if it doesn't exist.
//   if (
//     flattenedOptions.findIndex(
//       option => option.label.trim().toLowerCase() === normalizedSearchValue
//     ) === -1
//   ) {
//     schedule_delivery_recipient_options.push(newOption);
//   }

//   // Select the option.
//   setSelected([...selectedOptions, newOption]);
// };

const emptyMessageScheduledReports = (
  <div>
    <h3>You Have No Scheduled Reports</h3>
    <p>
      Create a new schedule to get started
    </p>
    <EuiButton fill>Create Schedule</EuiButton>
  </div>
)
const loading = false

export class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dashboardList: [],
      selectedDashboard: "",
      selectedScheduleFrequency: "",
      selectedDashboardForSchedule: "",
      schedulerEmailAddress: "",
      scheduledReportFileName: [],
      pagination: this.pagination,
      renderCreateReport: false,
      selectedOptions: this.selectedOptions,
      setSelected: this.setSelected,
    };
    this.renderDashboardTable = this.renderDashboardTable.bind(this);
    this._createReportScreen = this._createReportScreen.bind(this);
    this._onButtonClick = this._onButtonClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeDeliveryRecipients = this.onChangeDeliveryRecipients.bind(this);
    this.onCreateOption = this.onCreateOption.bind(this);
    this.setSelectedFunc = this.setSelectedFunc.bind(this);
    this.setSelectedOptions = this.setSelectedOptions.bind(this);
  }

  // [selectedOptions, setSelected] = useState(schedule_delivery_recipient_options[1], schedule_delivery_recipient_options[2]);
  setSelectedOptions() {
    selectedOptions = useState(schedule_delivery_recipient_options[1]);
  }

  setSelectedFunc() {
    setSelected = useState(schedule_delivery_recipient_options[2]);
  }

  onChangeDeliveryRecipients = selectedOptions => {
    this.setSelected(selectedOptions);
  };
  
  onCreateOption = (searchValue, flattenedOptions = []) => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();
  
    if (!normalizedSearchValue) {
      return;
    }
  
    const newOption = {
      label: searchValue,
    };
  
    // Create the option if it doesn't exist.
    if (
      flattenedOptions.findIndex(
        option => option.label.trim().toLowerCase() === normalizedSearchValue
      ) === -1
    ) {
      schedule_delivery_recipient_options.push(newOption);
    }
  
    // Select the option.
    this.setSelected([...selectedOptions, newOption]);
  };

  onSelectedTabChanged = id => {
    setSelectedTabId(id);
  };

  renderDashboardTable() {
    return this.state.dashboardList.map((dashboard, index) => {
      const { name, id } = dashboard;
      return (
        <tr key={id}>
           <EuiButton type="primary" 
           onClick={() => fetchDownloadApi("http://localhost:5601/app/kibana#/dashboard/" + id)}>{name}</EuiButton>
        </tr>
      )
    })
  }


  onChangeDashboard = selectedDashboard => {
    this.setState({ selectedDashboard });
  };

  pagination = {
    initialPageSize: 10,
    pageSizeOptions: [8, 10, 13],
  };

  tabs = [
    {
      id: 'report',
      name: 'Reports',
      content: (
        <Fragment>
          <EuiSpacer />
            <div>
              <EuiInMemoryTable
              items={reports_list_users}
              itemId="id"
              error={this.error}
              loading={loading}
              message={emptyMessageReports}
              columns={reports_list_columns}
              search={reports_list_search}
              pagination={this.pagination}
              sorting={true}
              selection={reports_list_selection_value}
              isSelectable={true}
              />
            </div>
        </Fragment>
      )
    },
    {
      id: 'scheduled-reports',
      name: 'Scheduled Reports',
      content: (
        <Fragment>
          <EuiSpacer />
            <EuiText textAlign={"center"}>
              {emptyMessageScheduledReports}
            </EuiText>
        </Fragment> 
      )
    },
    {
      id: 'templates',
      name: 'Templates',
      content: (
        <Fragment>
          <EuiSpacer />
            <EuiText textAlign={"center"}>
              {emptyMessageTemplatesEui}
            </EuiText>
        </Fragment>
      )
    }
  ]

  _createReportScreen() {
    console.log("in create report screen")
    // return (
    //   <EuiPage>
    //     Hello
    //   </EuiPage>
    // )
    window.open('create_report.js');
  }

  _onButtonClick() {
    this.setState({
      showComponent: true,
    });
  }

  onChange = e => {
    setChecked(e.target.checked);
  };

  componentDidMount() {
    const { httpClient } = this.props;
    httpClientGlobal = httpClient;
    httpClient.get('../api/reporting/example').then((resp) => {
      this.setState({ time: resp.data.time });
    });
    httpClient.get('../api/reporting/get_dashboards').then((resp) => {
      this.setState({ dashboardList: getDashboardList(resp.data) })
      let dropdownDashboardList = resp.map(dashboard => {
        return {value: dashboard, display: dashboard}
      });
      this.setState({
        dropdownDashboardList: [{value: '', display: '(Select a dashboard to download)'}].concat(dropdownDashboardList)
      });
    });
  }

  render() {
    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageContent panelPaddingSize={"l"}>
            <EuiFlexGroup justifyContent="spaceEvenly">
              <EuiFlexItem>
                <EuiTitle>
                  <h2>Reports ({reports_list_users.length})</h2>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem component="span" grow={false}>
                <EuiButton size="m">
                  Delete
                </EuiButton>  
              </EuiFlexItem>  
            </EuiFlexGroup>
            <EuiHorizontalRule/>
            <EuiInMemoryTable
              items={reports_list_users}
              itemId="id"
              error={this.error}
              loading={false}
              message={emptyMessageReports}
              columns={reports_list_columns}
              search={reports_list_search}
              pagination={this.pagination}
              sorting={true}
              selection={reports_list_selection_value}
              isSelectable={true}
              />
          </EuiPageContent>
          <EuiSpacer/>
          <EuiPageContent panelPaddingSize={"l"} component="div" width="50px">
            <EuiFlexGroup justifyContent="spaceEvenly">
              <EuiFlexItem>
                <EuiTitle>
          <h2>Scheduled Reports ({scheduled_reports.length})</h2>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem component="span" grow={false}>
                <EuiButton size="m">
                  Delete
                </EuiButton>  
              </EuiFlexItem>  
              <EuiFlexItem component="span" grow={false}>
                <EuiButton size="m">
                  Edit
                </EuiButton>  
              </EuiFlexItem>              
              <EuiFlexItem component="span" grow={false}>
                <EuiButton 
                  fill={true}
                  onClick={() => {window.location.assign('reporting#/create')}}
                >
                  Create
                </EuiButton>
              </EuiFlexItem>          
            </EuiFlexGroup>
            <EuiHorizontalRule/>
            <EuiInMemoryTable
              items={scheduled_reports}
              itemId="id"
              error={this.error}
              loading={false}
              message={emptyMessageScheduledReports}
              columns={scheduled_report_columns}
              search={reports_list_search} // todo: change?
              pagination={this.pagination}
              sorting={true}
              selection={reports_list_selection_value} // todo: change?
              isSelectable={true}
            />
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}
