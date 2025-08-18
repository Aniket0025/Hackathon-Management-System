"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Brain,
  Users,
  Zap,
  Target,
  Code,
  Palette,
  Database,
  Smartphone,
  Star,
  TrendingUp,
  CheckCircle,
} from "lucide-react"

export default function AITeamMatching() {
  const [isMatching, setIsMatching] = useState(false)
  const [matchResults, setMatchResults] = useState(null)

  const handleAIMatching = () => {
    setIsMatching(true)
    setTimeout(() => {
      setMatchResults({
        compatibility: 94,
        skillBalance: 87,
        experienceLevel: 91,
        communicationStyle: 89,
      })
      setIsMatching(false)
    }, 3000)
  }

  const skillCategories = [
    { icon: Code, name: "Frontend", color: "bg-blue-500", participants: 45 },
    { icon: Database, name: "Backend", color: "bg-green-500", participants: 38 },
    { icon: Palette, name: "Design", color: "bg-purple-500", participants: 22 },
    { icon: Smartphone, name: "Mobile", color: "bg-orange-500", participants: 31 },
  ]

  const suggestedTeams = [
    {
      id: 1,
      name: "AI Innovators",
      compatibility: 96,
      members: [
        {
          name: "Sarah Chen",
          role: "Full-Stack Dev",
          avatar: "/diverse-professional-team.png",
          skills: ["React", "Node.js", "AI/ML"],
        },
        {
          name: "Marcus Johnson",
          role: "UI/UX Designer",
          avatar: "/ai-team.png",
          skills: ["Figma", "Prototyping", "User Research"],
        },
        {
          name: "Elena Rodriguez",
          role: "Data Scientist",
          avatar: "/web-team-collaboration.png",
          skills: ["Python", "TensorFlow", "Analytics"],
        },
        {
          name: "David Kim",
          role: "Mobile Dev",
          avatar: "/interconnected-system.png",
          skills: ["React Native", "iOS", "Android"],
        },
      ],
      strengths: ["Balanced skill set", "High collaboration score", "Complementary experience levels"],
      projectFit: "Perfect for AI/ML and mobile app challenges",
    },
    {
      id: 2,
      name: "Code Warriors",
      compatibility: 91,
      members: [
        {
          name: "Alex Thompson",
          role: "Backend Dev",
          avatar: "/desk-organizer.png",
          skills: ["Python", "PostgreSQL", "AWS"],
        },
        {
          name: "Maya Patel",
          role: "Frontend Dev",
          avatar: "/abstract-geometric-shapes.png",
          skills: ["Vue.js", "TypeScript", "CSS"],
        },
        {
          name: "Jordan Lee",
          role: "DevOps",
          avatar: "/diverse-professional-team.png",
          skills: ["Docker", "Kubernetes", "CI/CD"],
        },
      ],
      strengths: ["Strong technical foundation", "Fast execution", "Proven track record"],
      projectFit: "Ideal for web applications and infrastructure challenges",
    },
  ]

  return (
    <div className="space-y-8">
      {/* AI Matching Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">AI-Powered Team Matching</CardTitle>
              <CardDescription className="text-lg">
                Advanced algorithms create optimal team compositions based on skills, experience, and collaboration
                patterns
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleAIMatching}
              disabled={isMatching}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isMatching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing Participants...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Optimal Teams
                </>
              )}
            </Button>
            <Button variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Custom Matching Criteria
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skill Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" />
            Participant Skill Distribution
          </CardTitle>
          <CardDescription>Real-time analysis of available skills and expertise levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skillCategories.map((skill, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-16 h-16 ${skill.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}
                >
                  <skill.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900">{skill.name}</h4>
                <p className="text-2xl font-bold text-slate-700">{skill.participants}</p>
                <p className="text-sm text-slate-500">participants</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matching Results */}
      {matchResults && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <CardTitle className="text-green-900">AI Matching Complete</CardTitle>
                <CardDescription className="text-green-700">
                  Analysis of {suggestedTeams.length} optimal team configurations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">{matchResults.compatibility}%</div>
                <p className="text-sm text-green-700">Compatibility</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">{matchResults.skillBalance}%</div>
                <p className="text-sm text-green-700">Skill Balance</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">{matchResults.experienceLevel}%</div>
                <p className="text-sm text-green-700">Experience Match</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">{matchResults.communicationStyle}%</div>
                <p className="text-sm text-green-700">Communication</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Teams */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-900">AI-Generated Team Suggestions</h3>
        {suggestedTeams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {team.name}
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Star className="w-3 h-3 mr-1" />
                      {team.compatibility}% match
                    </Badge>
                  </CardTitle>
                  <CardDescription>{team.projectFit}</CardDescription>
                </div>
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-600">Form Team</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Team Members</h4>
                  <div className="space-y-3">
                    {team.members.map((member, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-600">{member.role}</p>
                        </div>
                        <div className="flex gap-1">
                          {member.skills.slice(0, 2).map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Team Strengths</h4>
                  <div className="space-y-2">
                    {team.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-slate-700">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
