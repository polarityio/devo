module.exports = {
  /**
   * Name of the integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @required
   */
  name: 'Devo',
  /**
   * The acronym that appears in the notification window when information from this integration
   * is displayed.  Note that the acronym is included as part of each "tag" in the summary information
   * for the integration.  As a result, it is best to keep it to 4 or less characters.  The casing used
   * here will be carried forward into the notification window.
   *
   * @type String
   * @required
   */
  acronym: 'DEVO',
  /**
   * Description for this integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @optional
   */
  description:
    'Devo is the cloud-native logging solution that delivers real-time visibility for security and operations teams.',
  entityTypes: ['IPv4', 'IPv6', 'hash', 'email', 'domain'],
  /**
   * An array of style files (css or less) that will be included for your integration. Any styles specified in
   * the below files can be used in your custom template.
   *
   * @type Array
   * @optional
   */
  styles: ['./styles/style.less'],
  /**
   * Provide custom component logic and template for rendering the integration details block.  If you do not
   * provide a custom template and/or component then the integration will display data as a table of key value
   * pairs.
   *
   * @type Object
   * @optional
   */
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  summary: {
    component: {
      file: './components/summary.js'
    },
    template: {
      file: './templates/summary.hbs'
    }
  },
  request: {
    // Provide the path to your certFile. Leave an empty string to ignore this option.
    // Relative paths are relative to the Urlhaus integration's root directory
    cert: '',
    // Provide the path to your private key. Leave an empty string to ignore this option.
    // Relative paths are relative to the Urlhaus integration's root directory
    key: '',
    // Provide the key passphrase if required.  Leave an empty string to ignore this option.
    // Relative paths are relative to the Urlhaus integration's root directory
    passphrase: '',
    // Provide the Certificate Authority. Leave an empty string to ignore this option.
    // Relative paths are relative to the Urlhaus integration's root directory
    ca: '',
    // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
    // the url parameter (by embedding the auth info in the uri)
    proxy: '',

    rejectUnauthorized: true
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  /**
   * Options that are displayed to the user/admin in the Polarity integration user-interface.  Should be structured
   * as an array of option objects.
   *
   * @type Array
   * @optional
   */
  options: [
    {
      key: 'url',
      name: 'Base Devo URL',
      description:
        'The base URL for the Devo REST API including the schema (i.e., https://) and port.',
      type: 'text',
      default: 'https://apiv2-us.devo.com/search',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'apiToken',
      name: 'Devo Authentication Token',
      description:
        'A valid Devo OAuth authentication token.',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'searchString',
      name: 'Devo Query String',
      description:
        'Devo query to execute expressed in LINQ script. The string `{{ENTITY}}` will be replace by the looked up indicator. For example: from firewall.all.traffic where dstIp = {{ENTITY}}',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'searchDays',
      name: 'Number of Days to Search',
      description:
        'Relative number of days in history to search from now.',
      default: 7,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'searchLimit',
      name: 'Search Result Limit',
      description:
        'Maximum number of query results to return in the Polarity overlay.',
      default: 10,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'summaryFields',
      name: 'Summary Fields',
      description:
        'Comma delimited list of field values to include as part of the summary (no spaces between commas).  These fields must be returned by your search query. This option must be set to "User can view and edit" or "User can view only".',
      default: '',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'includeFieldNameInSummary',
      name: 'Include Field Name in Summary',
      description:
        'If checked, field names will be included as part of the summary fields. This option must be set to "User can view and edit" or "User can view only".',
      default: false,
      type: 'boolean',
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
