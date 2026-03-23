import { Search, Bell, Menu } from "lucide-react"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"

export function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-[#343e43] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-300 lg:hidden hover:text-white"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-600 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-2 lg:pl-0 lg:w-4"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm bg-transparent outline-none"
            placeholder="Search dashboard..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-300 hover:text-white relative transition-colors"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f9bf3b] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f9bf3b]"></span>
            </span>
          </button>

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-600"
            aria-hidden="true"
          />

          {/* Profile dropdown Placeholder */}
          <div className="relative">
            <button className="-m-1.5 flex items-center p-1.5 focus:outline-none">
              <span className="sr-only">Open user menu</span>
              <Avatar className="h-8 w-8 border border-gray-600">
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
              <span className="hidden lg:flex lg:items-center ml-4">
                <span
                  className="text-sm font-semibold leading-6 text-white"
                  aria-hidden="true"
                >
                  John Doe
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
