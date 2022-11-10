import React from 'react';
import { chain, merge, size } from 'lodash';
import CytoscapeComponent from 'react-cytoscapejs';
import { entity } from './dummy';

import { get, mapKeys, camelCase } from 'lodash';

// camelCase and or rename keys
export const schemafyKeys = (arr, type) => (arr || []).map(obj => ({
  ...mapKeys(obj, (_, key) => camelCase(key)),
  ...get({
    locations: { name: get(obj, 'country') },
    people: { role: get(obj, 'relationship'), dateOfBirth: get(obj, 'dob') },
  }, type, {}),
}));

export const MyGraph = () => {
  const {  name, riskData: { results: entityResults } = {} } = entity.data || {};

  const results = entityResults || [];

  const associations = chain(results).map(r => r.associations).flatten().value();

  const mergedAssociations = associations.reduce((prev, curr) => merge(prev, curr), {});

  const { companies = [], direct_owners: directOwners = [], people = []  } = mergedAssociations;

  const peopleData = schemafyKeys(people);
  const companiesData = schemafyKeys(companies);
  const directOwnersData = schemafyKeys(directOwners);

  const peopleNodes = size(peopleData) ? peopleData.map(({ name, fullRelationship, relationship, type }, i) => ({ 
    data: { 
      id: `person-${i}`,  
      icon: "https://images.unsplash.com/photo-1455582916367-25f75bfc6710?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGZsb3dlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      label: name, 
      title: fullRelationship, 
      type 
    } })) : [];
  const companyNodes = size(companiesData) ? companiesData.map(({ name, fullRelationship, relationship, type }, i) => ({ data: { id: `company-${i}`, label: name, title: fullRelationship, type }})) : [];
  const hopTwoNodes = size(directOwners) ? directOwnersData.map(({ name, fullRelationship, relationship, type }, i) => ({ data: { id: `direct-owner-${i}`, label: name, title: fullRelationship, type } })) : [];
  const edgesArray = size(peopleData) ? peopleData.map(({ name, relationship }, i) => ({ data: { source: 1, target: `person-${i}`, label: relationship } })) : [];

  const companyEdgesArray = size(companiesData) ? companiesData.map(({ name, relationship }, i) => ({ data: { source: 1, target: `company-${i}`, label: relationship } })) : [];
  const directOwnersEdgesArray = size(directOwners) ? directOwnersData.map(({ name, relationship }, i) => ({ data: { source: 1, target: `direct-owner-${i}`, label: relationship } })) : [];

    const elements = [
      { data: { id: 1, label: name, title: name, type: 'rose' } },
      ...peopleNodes,
      ...companyNodes,
      ...hopTwoNodes,
      ...edgesArray,
      ...companyEdgesArray,
      ...directOwnersEdgesArray,
      // {data: { source: 'person-1', target: 'company-1' }}, 
      // {data: { source: 'person-1', target: 'direct-owner-2'}}, 
      // {data: { source: 'person-2', target: 'company-2'}}, 
      // {data: { source: 'person-3', target: 'direct-owner-3'}}, 
      // {data: { source: 'person-3', target: 'direct-owner-4'}}, 
      // {data: { source: 'company-1', target: 'direct-owner-4'}}, 
      // {data: { source: 'company-1', target: 'person-5' }}
    ];


    const layout = {
      name: 'random'
    }

    return <CytoscapeComponent 
      layout={layout}
      elements={elements} 
      stylesheet={[
        {
      selector: "node",
      css: {
        label: "data(id)",
        "background-image": "data(icon)",
        height: 80,
        width: 80,
        "background-fit": "cover"
      }
    },
          {
            selector: 'node',
            style: {
              'background-color': '#282',
              'label': 'data(label)',
              'color': '#fff'
              //opacity: 0.3
            }
          },
          {
            selector: 'node[type="comp"]',
            style: {
              'background-color': '#822',
            }
          },
          {
            selector: 'node[type="person"]',
            style: {
              // 'background-color': '#f2e300',
            }
          },
          {
            selector: 'node[type="company"]',
            style: {
              'background-color': '#144848',
            }
          },
          {
            selector: 'node[type="direct-owner"]',
            style: {
              'background-color': '#ab0000',
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier'
            }
          }
        ]}
        style={{
          width: "600px",
          height: "600px"
        }}
 />;
  }
