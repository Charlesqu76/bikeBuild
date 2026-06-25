export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium text-muted-foreground">Project initialized</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
          Bike Build
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          The application shell is ready. Product features, component data, and
          compatibility behavior have not been added yet.
        </p>
      </section>
    </main>
  );
}
