"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const Page = ({
  params,
}: {
  params: { username: string; reponame: string };
}) => {
  const [branches, setBranches] = useState([]);
  const { data: session } = useSession();
  let accessToken = session?.access_token;

  useEffect(() => {
    fetch(
      `https://api.github.com/repos/${params.username}/${params.reponame}/branches`,
      {
        headers: { Authorization: `${accessToken}` },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setBranches(data);
      })
      .catch((error) => {
        console.error("Error fetching branches:", error);
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 text-slate-800">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Select a branches to continue
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href={`/repos/${params.username}/${params.reponame}/main`}
          className="bg-gray-100 p-4 rounded-md shadow-md"
        >
          <p className="text-lg font-semibold">main</p>
        </Link>
        {branches.map((branch) => (
          <Link
            href={`/repos/${params.username}/${params.reponame}/${branch.name}`}
            key={branch.name}
            className="bg-gray-100 p-4 rounded-md shadow-md"
          >
            <p className="text-lg font-semibold">{branch.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
