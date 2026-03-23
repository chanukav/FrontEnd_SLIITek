import { Menu, Search, User } from "lucide-react"
import { NotificationDropdown } from "./NotificationDropdown"

export function Header({ setIsOpen }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b bg-header px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="-m-2.5 p-2.5 text-white/80 hover:text-white lg:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1 items-center" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <div className="relative w-full max-w-md">
            <Search
              className="absolute inset-y-0 left-3 h-full w-5 text-white/50"
              aria-hidden="true"
            />
            <input
              id="search-field"
              className="block h-10 w-full rounded-md border-0 bg-white/10 py-1.5 pl-10 pr-3 text-white placeholder:text-white/60 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6 transition-colors duration-200"
              placeholder="Search..."
              type="search"
              name="search"
            />
          </div>
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <NotificationDropdown />

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/20" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="flex items-center gap-x-4">
            <span className="hidden lg:flex lg:items-center">
              <span className="text-sm font-semibold leading-6 text-white" aria-hidden="true">
                Admin User
              </span>
            </span>
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
