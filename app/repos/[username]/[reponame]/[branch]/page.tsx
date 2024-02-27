"use client";
import React, { useEffect, useState } from "react";
import xmlJs from "xml-js";
import { useSession } from "next-auth/react";

function DependencyDisplay({ data }) {
  // Render dependencies
  function renderDependencies() {
    if (
      !data ||
      !data.project ||
      !data.project.dependencyManagement ||
      !data.project.dependencyManagement.dependencies ||
      !data.project.dependencyManagement.dependencies.dependency
    ) {
      return <div className="text-red-500">No dependencies found</div>;
    }

    const dependencies =
      data.project.dependencyManagement.dependencies.dependency;

    // Extract unique groupId and version pairs
    const uniqueDependencies = dependencies.reduce((acc, dependency) => {
      const groupId = dependency.groupId._text;
      const version = dependency.version?._text || "";
      const isVariable = version.startsWith("${");
      const existingIndex = acc.findIndex((item) => item.groupId === groupId);
      if (existingIndex === -1) {
        acc.push({ groupId, version, isVariable });
      } else {
        // If version already exists for the groupId, update it
        if (!isVariable && acc[existingIndex].version !== version) {
          acc[existingIndex].version += `, ${version}`;
        }
      }
      return acc;
    }, []);

    return (
      <div className="mt-4">
        {uniqueDependencies.map((dependency, index) => (
          <div key={index} className="mb-2">
            <p className="text-blue-700 font-semibold">{dependency.groupId}</p>
            {dependency.isVariable ? null : (
              <p className="text-gray-600">{dependency.version}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mt-6 mb-2">Dependencies</h2>
      {renderDependencies()}
    </div>
  );
}

const Page = ({
  params,
}: {
  params: { username: string; reponame: string; branch: string };
}) => {
  const [xmlData, setXmlData] = useState(null);
  const [error, setError] = useState();

  useEffect(() => {
    fetch(
      `https://raw.githubusercontent.com/${params.username}/${params.reponame}/${params.branch}/pom.xml`
    )
      .then((response) => response.text())
      .then((xmlText) => {
        const jsonData = xmlJs.xml2json(xmlText, { compact: true, spaces: 4 });

        setXmlData(JSON.parse(jsonData));
      })

      .catch((error) => {
        setError(error);
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {xmlData && xmlData.project ? (
        <div>
          <DependencyDisplay data={xmlData} />
        </div>
      ) : error ? (
        <div className="text-red-500">No dependencies found</div>
      ) : (
        <p>Loading XML data...</p>
      )}
    </div>
  );
};

export default Page;
