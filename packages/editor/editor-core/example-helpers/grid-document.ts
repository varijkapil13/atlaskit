export const exampleDocument = {
  version: 1,
  type: 'doc',
  content: [
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'this is a list',
                },
              ],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'and I am indented',
                        },
                      ],
                    },
                    {
                      type: 'bulletList',
                      content: [
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [
                                {
                                  type: 'text',
                                  text: 'here’s an image',
                                },
                              ],
                            },
                            {
                              type: 'bulletList',
                              content: [
                                {
                                  type: 'listItem',
                                  content: [
                                    {
                                      type: 'mediaSingle',
                                      attrs: {
                                        width: 0.33,
                                      },
                                      content: [
                                        {
                                          type: 'media',
                                          attrs: {
                                            id:
                                              'b5425161-d01f-412e-87c8-467e884a8280',
                                            type: 'file',
                                            collection: 'MediaServicesSample',
                                            width: 2750,
                                            height: 2061,
                                          },
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: 'Wrap Left - 4 columns',
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        layout: 'wrap-left',
        width: 0.33,
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: 'b5425161-d01f-412e-87c8-467e884a8280',
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2750,
            height: 2061,
          },
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mi nisl, venenatis eget auctor vitae, venenatis quis lorem. Suspendisse maximus tortor vel dui tincidunt cursus. Vestibulum magna nibh, auctor non auctor id, finibus vitae orci. Nulla viverra ipsum et nunc fringilla ultricies. Pellentesque vitae felis molestie justo finibus accumsan. Suspendisse potenti. Nulla facilisi. Integer dignissim quis velit quis elementum. Sed sit amet varius ante. Duis vestibulum porta augue eu laoreet. Morbi id risus et augue sollicitudin aliquam. In et ligula dolor. Nam ac aliquet diam.',
        },
      ],
    },

    {
      type: 'heading',
      attrs: {
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: 'Two Equal',
        },
      ],
    },
    {
      type: 'layoutSection',
      attrs: {
        layoutType: 'two_equal',
      },
      content: [
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '4 columns',
                },
              ],
            },
            {
              type: 'mediaSingle',
              attrs: {
                layout: 'center',
                width: 0.33,
              },
              content: [
                {
                  type: 'media',
                  attrs: {
                    id: 'b5425161-d01f-412e-87c8-467e884a8280',
                    type: 'file',
                    collection: 'MediaServicesSample',
                    width: 2750,
                    height: 2061,
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '6 columns',
                },
              ],
            },
            {
              type: 'mediaSingle',
              attrs: {
                layout: 'center',
                width: 0.49,
              },
              content: [
                {
                  type: 'media',
                  attrs: {
                    id: 'b5425161-d01f-412e-87c8-467e884a8280',
                    type: 'file',
                    collection: 'MediaServicesSample',
                    width: 2750,
                    height: 2061,
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    {
      type: 'heading',
      attrs: {
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: 'Wrap Right - 8 columns',
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        layout: 'wrap-right',
        width: 0.66,
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: 'b5425161-d01f-412e-87c8-467e884a8280',
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2750,
            height: 2061,
          },
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mi nisl, venenatis eget auctor vitae, venenatis quis lorem. Suspendisse maximus tortor vel dui tincidunt cursus. Vestibulum magna nibh, auctor non auctor id, finibus vitae orci. Nulla viverra ipsum et nunc fringilla ultricies. Pellentesque vitae felis molestie justo finibus accumsan. Suspendisse potenti. Nulla facilisi. Integer dignissim quis velit quis elementum. Sed sit amet varius ante. Duis vestibulum porta augue eu laoreet. Morbi id risus et augue sollicitudin aliquam. In et ligula dolor. Nam ac aliquet diam.',
        },
      ],
    },

    /**********************************************************************/

    {
      type: 'heading',
      attrs: {
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: '12 Columns',
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        layout: 'center',
        width: 1,
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: 'b5425161-d01f-412e-87c8-467e884a8280',
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2750,
            height: 2061,
          },
        },
      ],
    },

    /**********************************************************************/

    {
      type: 'heading',
      attrs: {
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: '6 Columns',
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        layout: 'center',
        width: 0.5,
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: 'b5425161-d01f-412e-87c8-467e884a8280',
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2750,
            height: 2061,
          },
        },
      ],
    },

    /**********************************************************************/

    {
      type: 'heading',
      attrs: {
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: '4 Columns',
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        layout: 'center',
        width: 0.33,
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: 'b5425161-d01f-412e-87c8-467e884a8280',
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2750,
            height: 2061,
          },
        },
      ],
    },

    /**********************************************************************/

    {
      type: 'heading',
      attrs: {
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: '2 Columns',
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        layout: 'center',
        width: 0.165,
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: 'b5425161-d01f-412e-87c8-467e884a8280',
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2750,
            height: 2061,
          },
        },
      ],
    },

    /**********************************************************************/

    {
      type: 'heading',
      attrs: {
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: 'Layouts',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: 'Two Equal',
        },
      ],
    },
    {
      type: 'layoutSection',
      attrs: {
        layoutType: 'two_equal',
      },
      content: [
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '4 columns',
                },
              ],
            },
            {
              type: 'mediaSingle',
              attrs: {
                layout: 'center',
                width: 0.33,
              },
              content: [
                {
                  type: 'media',
                  attrs: {
                    id: 'b5425161-d01f-412e-87c8-467e884a8280',
                    type: 'file',
                    collection: 'MediaServicesSample',
                    width: 2750,
                    height: 2061,
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '6 columns',
                },
              ],
            },
            {
              type: 'mediaSingle',
              attrs: {
                layout: 'center',
                width: 0.5,
              },
              content: [
                {
                  type: 'media',
                  attrs: {
                    id: 'b5425161-d01f-412e-87c8-467e884a8280',
                    type: 'file',
                    collection: 'MediaServicesSample',
                    width: 2750,
                    height: 2061,
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    {
      type: 'heading',
      attrs: {
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: 'Three Equal',
        },
      ],
    },
    {
      type: 'layoutSection',
      attrs: {
        layoutType: 'three_equal',
      },
      content: [
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '2 columns',
                },
              ],
            },
            {
              type: 'mediaSingle',
              attrs: {
                layout: 'center',
                width: 0.166,
              },
              content: [
                {
                  type: 'media',
                  attrs: {
                    id: 'b5425161-d01f-412e-87c8-467e884a8280',
                    type: 'file',
                    collection: 'MediaServicesSample',
                    width: 2750,
                    height: 2061,
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '4 columns',
                },
              ],
            },
            {
              type: 'mediaSingle',
              attrs: {
                layout: 'center',
                width: 0.32,
              },
              content: [
                {
                  type: 'media',
                  attrs: {
                    id: 'b5425161-d01f-412e-87c8-467e884a8280',
                    type: 'file',
                    collection: 'MediaServicesSample',
                    width: 2750,
                    height: 2061,
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '2 columns',
                },
              ],
            },
            {
              type: 'mediaSingle',
              attrs: {
                layout: 'center',
                width: 0.166,
              },
              content: [
                {
                  type: 'media',
                  attrs: {
                    id: 'b5425161-d01f-412e-87c8-467e884a8280',
                    type: 'file',
                    collection: 'MediaServicesSample',
                    width: 2750,
                    height: 2061,
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    /**********************************************************************/

    {
      type: 'heading',
      attrs: {
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: 'Center',
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        layout: 'center',
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: 'b5425161-d01f-412e-87c8-467e884a8280',
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2750,
            height: 2061,
          },
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: 'Wide',
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        layout: 'wide',
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: 'b5425161-d01f-412e-87c8-467e884a8280',
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2750,
            height: 2061,
          },
        },
      ],
    },

    /**********************************************************************/

    {
      type: 'heading',
      attrs: {
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: 'Full Width',
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        layout: 'full-width',
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: 'b5425161-d01f-412e-87c8-467e884a8280',
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2750,
            height: 2061,
          },
        },
      ],
    },
  ],
};
